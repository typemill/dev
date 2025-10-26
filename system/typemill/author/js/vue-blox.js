const bloxeditor = Vue.createApp({
	template: `<div v-if="editorVisible" class="px-2 lg:px-12 py-8 bg-stone-50 dark:bg-stone-700 dark:text-stone-200 shadow-md mb-16">
					<div class="absolute top-0 right-0">
						<button 
							@click.prevent="openkixoteai()"
							class="mr-1 px-2 py-2 bg-stone-50 border-b-2 border-stone-50 hover:bg-stone-200 dark:text-stone-200 dark:bg-stone-700 dark:border-stone-600 hover:dark:bg-stone-200 hover:dark:text-stone-900 transition duration-100"
						>
							<svg class="icon icon-magic-wand"><use xlink:href="#icon-magic-wand"></use></svg>
						</button>
						<button 
							@click.prevent="openmedialib()"
							class="px-2 py-2 bg-stone-50 border-b-2 border-stone-50 hover:bg-stone-200 dark:text-stone-200 dark:bg-stone-700 dark:border-stone-600 hover:dark:bg-stone-200 hover:dark:text-stone-900 transition duration-100"
						>
							<svg class="icon icon-image"><use xlink:href="#icon-image"></use></svg>
						</button>
						<Transition name="initial" appear>
							<div v-if="showmedialib" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 z-50">
								<button class="w-full bg-stone-200 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
								<medialib parentcomponent="images" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
							</div>
						</Transition>
					</div>
					
					<draggable 
						v-model="content" 
						@start="onStart"
						:move="checkMove" 
						@end="onEnd"
						handle=".dragme"
						item-key="element.id"
						v-bind="dragOptions">
							<template #item="{element, index}">
								<content-block :element="element" :index="index" :class="{dragme: index != 0}"></content-block>
							</template>
					</draggable>
					<new-block ref="newBlock" :index="999999"></new-block>
				</div>
				`,
	data() {
		return {
			showmedialib: false,
			content: data.content,
			editorVisible: true,
			dragDisabled: false,
		}
	},
	components: {
		medialib: medialib
	},	
	computed: 
	{
		dragOptions() 
		{
			return {
				animation: 150,
				disabled: this.dragDisabled,
				ghostClass: "ghost",
				delay: 150,
				delayOnTouchOnly: true
			};
		},
	},
	mounted() {

		document.getElementById("initial-content").remove();

		eventBus.$on('content', (content) => {
			this.content = content;
		});
		eventBus.$on('showEditor', (value) => {
			this.editorVisible = value;
		});
		eventBus.$on('disableDrag', (value) => {
			this.dragDisabled = value;
		});
	},
	methods: {
		openkixoteai()
		{
			eventBus.$emit('startAi');
		},
		openmedialib()
		{
			this.showmedialib = true;
		},
		addFromMedialibFunction(media)
		{
			componentType = false;

			if (typeof media === 'string')
			{
				componentType = 'image-component';
				markdown = '![](' + media + ')';
			}
			else if (media.active === 'videos')
			{
				componentType = 'video-component';
				markdown = '[:video path="'+ media.url +'" width="500" preload="auto" :]';
			}
			else if (media.active === 'audios')
			{
				componentType = 'audio-component';
				markdown = '[:audio path="' + media.url + '" width="500px" preload="auto" :]';
			}
			else
			{
				componentType = 'file-component';
				markdown = '[' + media.name + '](' + media.url + '){.tm-download file-' + media.extension + '}'
			}

			if(componentType)
			{
				this.showmedialib = false;
				this.$refs.newBlock.openWithData(componentType, markdown);
			
				this.$nextTick(() => {
					setTimeout(() => {
						window.scrollTo({
							top: document.body.scrollHeight,
							behavior: 'smooth'
						});
					}, 100); // small delay, e.g. 100–200ms
				});
			}
		},
		checkMove(event)
		{
			if(event.draggedContext.index == 0 || event.draggedContext.futureIndex == 0)
			{
				return false;
			}
		},
		onStart(event)
		{
		},
		onEnd(evt)
		{
			self = this;
			
			tmaxios.put('/api/v1/block/move',{
				'url':				data.urlinfo.route,
				'index_old': 		evt.oldIndex,
				'index_new': 		evt.newIndex,
			})
			.then(function (response)
			{
				self.content = response.data.content;
				if(response.data.navigation)
				{
					eventBus.$emit('navigation', response.data.navigation);
				}
				if(response.data.item)
				{
					eventBus.$emit('item', response.data.item);					
				}
				this.$nextTick(function () {
					eventBus.$emit('renderblox');
				});				
			})
			.catch(function (error)
			{
				if(error.response)
				{
					let message = handleErrorMessage(error);
					if(message)
					{
						eventBus.$emit('publishermessage', message);
					}
				}
			});
		},
	},
})

bloxeditor.component('draggable', vuedraggable);

bloxeditor.component('content-block', {
	props: ['element', 'index'],
	template: `
			<div :class="{'edit': edit}">
				<div v-if="newblock" class="blox-editor bg-stone-100 dark:bg-stone-600">
					<div class="w-full flex justify-between bg-stone-200 dark:bg-stone-600">
						<p class="p-2 pl-4">Choose a content type</p>
						<button 
							class 				= "p-2 border-l border-stone-700 hover:text-white hover:bg-rose-500 transition-1" 
							@click 				= "closeNewBlock"
							>{{ $filters.translate('close') }}</button>
					</div>
					<new-block :index="index"></new-block>
				</div>
				<div class="relative blox-wrapper mb-1">
					<div v-if="index != 0" class="sideaction hidden absolute -top-3 left-1/2 -translate-x-1/2 z-1 text-xs">
						<button 
							class 				= "delete w-16 p-1 border-r border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-rose-500 hover:dark:bg-rose-500 hover:text-white transition-1" 
							@mousedown.prevent 	= "disableSort()" 
							@click.prevent 		= "deleteBlock"
							>{{ $filters.translate('delete') }}</button>
						<button 
							class 				= "add w-16 p-1 border-l border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-teal-500 hover:dark:bg-teal-500 hover:text-white transition-1" 
							:disabled 			= "disabled" 
							@mousedown.prevent 	= "disableSort()" 
							@click.prevent 		= "openNewBlock"
							>{{ $filters.translate('add') }}</button> 
					</div>
					<div 
						v-if 	= "!edit" 
						class 	= "blox-preview px-6 py-3 hover:bg-stone-100 hover:dark:bg-stone-900 overflow-hidden transition-1" 
						@click 	= "showEditor" 
						v-html 	= "getHtml(element.html)"></div>
					<div v-else class="blox-editor bg-stone-100 dark:bg-stone-900">
						<div v-if="load" class="absolute right-0 top-0 left-0 bottom-0 bg-stone-100 opacity-75">
							<svg class="animate-spin h-5 w-5 text-stone-900 absolute top-0 right-0 bottom-0 left-0 m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</div>
						<component 
							ref 					= "activeComponent" 
							:disabled 				= "disabled" 
							:markdown 				= "updatedmarkdown" 
							:index 					= "index" 
							@saveBlockEvent 		= "saveBlock" 
							@updateMarkdownEvent 	= "updateMarkdownFunction" 
							:is 					= "componentType"
							></component>
						<div class="edit-buttons absolute -bottom-3 right-4 z-10 text-xs">
							<button 
								class 				= "cancel w-20 p-1 border-r border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-rose-500 hover:dark:bg-rose-500 hover:text-white transition-1" 
								:disabled 			= "disabled" 
								@click.prevent 		= "closeEditor"
								>{{ $filters.translate('cancel') }}</button>
							<button 
								class 				= "save w-20 p-1 border-l border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-teal-500 hover:dark:bg-teal-500 hover:text-white transition-1" 
								:disabled 			= "disabled" 
								@click.prevent 		= "beforeSave()"
								>{{ $filters.translate('save') }}</button>
						</div>
					</div>
				</div>
			</div>
				`,
	data: function () {
		return {
			edit: 				false,
			disabled: 			false,
			newblock: 			false,
			load:  				false,

			componentType: 		false,
			updatedmarkdown: 	false,
			formats: 			activeFormats,
			hasUnsafedContent: 	false,
			countUpdates: 		0
		}
	},
	mounted: function()
	{
		this.updatedmarkdown = this.element.markdown;

		eventBus.$on('closeComponents', this.closeEditor);

		eventBus.$on('closeNewBlock', this.closeNewBlock);

		eventBus.$on('inlineFormat', (content) => {
			this.updatedmarkdown = content;
		});

		eventBus.$on('unsafedContent', (value) => {
			this.hasUnsafedContent = value;
		});
	},
	methods: {
		openNewBlock()
		{
			if(this.hasUnsafedContent)
			{
				eventBus.$emit('publishermessage', 'Save or cancel your changes first.');
			}
			else
			{
				this.newblock 	= true;
				this.edit 		= false;

				eventBus.$emit('closeComponents');
				eventBus.$emit('disableDrag', true);
			}
		},
		closeNewBlock()
		{
			this.newblock 			= false;
			this.componentType 		= false;
			this.updatedmarkdown 	= false;

			eventBus.$emit('publisherclear');
			eventBus.$emit('unsafedContent', false);
			eventBus.$emit('disableDrag', false);

			this.$nextTick(function () {
				eventBus.$emit('renderblox');
			});
		},
		closeEditor()
		{
			if(this.edit)
			{
				this.edit 				= false;
				this.newblock 			= false;
				this.componentType 		= false;
				this.updatedmarkdown 	= false;

				eventBus.$emit('publisherclear');
				eventBus.$emit('unsafedContent', false);
				eventBus.$emit('disableDrag', false);

				this.$nextTick(function () {
					eventBus.$emit('renderblox');
				});
			}
		},
		showEditor()
		{
			if(this.hasUnsafedContent)
			{
				eventBus.$emit('publishermessage', 'Save or cancel your changes first.');
			}
			else
			{
				eventBus.$emit('closeComponents');
				eventBus.$emit('disableDrag', true);

				this.edit 				= true;
				this.componentType 		= this.determineBlockType();
				this.updatedmarkdown 	= this.element.markdown;
			}
		},
		determineBlockType()
		{
			this.countUpdates = 0;
			
			if(this.index == 0)
			{
				return 'title-component';
			}

			let markdown 	= this.element.markdown;
			let lines 		= markdown.split("\n");

			for (var method in determiner) 
			{
				var specialBlock = determiner[method](markdown,lines,markdown[0],markdown[1],markdown[2]);

				if(specialBlock)
				{
					return specialBlock;
				}
			}

			return 'markdown-component';
		},
		updateMarkdownFunction(value)
		{
			this.updatedmarkdown = value;

			if(this.countUpdates > 0)
			{
				eventBus.$emit('unsafedContent', true);
			}

			this.countUpdates++;
		},
		disableSort()
		{
			eventBus.$emit('disableDrag', true);
		},
		deleteBlock()
		{
			eventBus.$emit('closeComponents');

			this.load 	= true;
			var self 	= this;

			eventBus.$emit('publisherclear');

			tmaxios.delete('/api/v1/block',{
				data: {
					'url':				data.urlinfo.route,
					'block_id':			this.index,
				}
			})
			.then(function (response)
			{
				eventBus.$emit('unsafedContent', false);
				self.load = false;
				self.$root.$data.content = response.data.content;
				if(response.data.navigation)
				{
					eventBus.$emit('navigation', response.data.navigation);
				}
				if(response.data.item)
				{
					eventBus.$emit('item', response.data.item);
				}
			})
			.catch(function (error)
			{
				self.load = false;
				if(error.response)
				{
					let message = handleErrorMessage(error);
					if(message)
					{
						eventBus.$emit('publishermessage', message);
					}
				}
			});
		},
		getHtml(html)
		{
			/* fix for empty html of abbreviations */
			if(html == '')
			{
				return '<p class="text-stone-300">Invisible: ' + this.element.markdown + '</p>';
			}
			return html;
		},
		beforeSave()
		{
			eventBus.$emit('beforeSave');
		},
		saveBlock()
		{
			if(
				this.updatedmarkdown == undefined || 
				this.updatedmarkdown == this.element.markdown ||
				this.updatedmarkdown.replace(/(\r\n|\n|\r|\s)/gm,"") == ''  
			)
			{
				this.closeEditor();
				return;
			}

			var self 	= this;
			this.load 	= true;

			eventBus.$emit('publisherclear');

			tmaxios.put('/api/v1/block',{
				'url':				data.urlinfo.route,
				'block_id':			this.index,
				'markdown': 		this.updatedmarkdown.trim(),
			})
			.then(function (response)
			{
				eventBus.$emit('unsafedContent', false);
				self.load 		= false;
				self.newblock 	= false;
				eventBus.$emit('closeComponents');


				self.$root.$data.content = response.data.content;
				if(response.data.navigation)
				{
					eventBus.$emit('navigation', response.data.navigation);
				}
				if(response.data.item)
				{
					eventBus.$emit('item', response.data.item);					
				}
				self.closeEditor();
			})
			.catch(function (error)
			{
				self.load = false;
				if(error.response)
				{
					let message = handleErrorMessage(error);
					if(message)
					{
						eventBus.$emit('publishermessage', message);
					}
				}
			});
		},
	},
})

bloxeditor.component('new-block',{
	props: ['markdown', 'index'],
	template: `
		<div class="w-full mb-4">
			<div v-if="!componentType" class="w-full flex flex-wrap p-4 dark:bg-stone-900">
				<button v-for="button in formats" 
					class="p-2 m-1 border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-700 hover:bg-stone-700 hover:dark:bg-stone-600 hover:text-stone-50 transition-1"  
					@click.prevent="setComponentType( $event, button.component )" 
					:title="button.title" 
					v-html="button.label">
				</button>
			</div>
			<div v-if="componentType" class="relative bg-stone-100 dark:bg-stone-900">
				<component ref="activeComponent" :disabled="disabled" :markdown="newblockmarkdown" :index="index" @saveBlockEvent="saveNewBlock" @updateMarkdownEvent="updateMarkdownFunction" :is="componentType"></component>
				<div class="edit-buttons absolute -bottom-3 right-4 z-2 text-xs">
					<button class="cancel w-20 p-1 border-r border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-rose-500 hover:dark:bg-rose-500 hover:text-white transition-1" :disabled="disabled" @click.prevent="closeComponent">{{ $filters.translate('cancel') }}</button>
					<button class="save w-20 p-1 border-l border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-teal-500 hover:dark:bg-teal-500 hover:text-white transition-1" :disabled="disabled" @click.prevent="beforeSaveNew()">{{ $filters.translate('save') }}</button>
				</div>
			</div>
		</div>
	`,
	data: function () {
		return {
			formats: activeFormats,
			componentType: false,
			disabled: false,
			newblockmarkdown: '',
			hasUnsafedContent: false,
		}
	},
	mounted: function()
	{
		eventBus.$on('closeComponents', this.closeComponent);

		eventBus.$on('inlineFormat', content => {
			this.newblockmarkdown = content;
		});

		eventBus.$on('unsafedContent', (value) => {
			this.hasUnsafedContent = value;
		});
	},
	methods: {
		openWithData(componentType, markdown)
		{
			this.componentType = false;
			this.newblockmarkdown = '';
			this.$nextTick(() => {
				this.componentType = componentType;
				this.newblockmarkdown = markdown;
			});
		},
		setComponentType(event, componenttype)
		{			
			if(this.hasUnsafedContent)
			{
				eventBus.$emit('publishermessage', 'Save or cancel your changes first.');
			}
			else
			{
				/* if it is a new block at the end of the page, close other open blocks first */
				if(this.index == 999999)
				{
					eventBus.$emit('closeComponents');
				}

				eventBus.$emit('disableDrag', true);

				this.componentType = componenttype;
			}
		},
		closeComponent()
		{
			this.componentType 		= false;
			this.newblockmarkdown 	= '';

			eventBus.$emit('publisherclear');
			eventBus.$emit('unsafedContent', false);
			eventBus.$emit('disableDrag', false);

			this.$nextTick(function () {
				eventBus.$emit('renderblox', 0);
			});			

		},
		updateMarkdownFunction(value)
		{
			eventBus.$emit('unsafedContent', true);
			this.newblockmarkdown = value;
		},
		beforeSaveNew()
		{
			eventBus.$emit('beforeSave');
		},
		saveNewBlock()
		{
			if(
				this.newblockmarkdown == undefined || 
				this.newblockmarkdown.replace(/(\r\n|\n|\r|\s)/gm,"") == ''
			)
			{
				this.closeComponent();
				return;
			}

			if(typeof this.$refs.activeComponent.saveBlock === "function")
			{
				this.$refs.activeComponent.saveBlock(this.updatedmarkdown);
				return; 
			}

			var self = this;

			eventBus.$emit('publisherclear');

			tmaxios.post('/api/v1/block',{
				'url':				data.urlinfo.route,
				'block_id':			this.index,
				'markdown': 		this.newblockmarkdown.trim(),
			})
			.then(function (response)
			{
				eventBus.$emit('unsafedContent', false);
				self.$root.$data.content = response.data.content;
				self.closeComponent();
				eventBus.$emit('closeComponents');
				eventBus.$emit('closeNewBlock');

				if(response.data.navigation)
				{
					eventBus.$emit('navigation', response.data.navigation);
				}
				if(response.data.item)
				{
					eventBus.$emit('item', response.data.item);					
				}

				if(self.index == 999999)
				{
					self.setComponentType(false, 'markdown-component');
				}

			})
			.catch(function (error)
			{
				if(error.response)
				{
					let message = handleErrorMessage(error);
					if(message)
					{
						eventBus.$emit('publishermessage', message);
					}
				}
			});
		},
	}
});
