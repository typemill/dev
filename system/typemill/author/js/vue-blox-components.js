bloxeditor.component('title-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
				<input 
					type 		= "text" 
					class 		= "opacity-1 w-full bg-transparent px-6 py-3 outline-none text-4xl font-bold my-5" 
					ref 		= "markdown" 
					:value 		= "markdown" 
					:disabled 	= "disabled" 
					@input 		= "updatemarkdown($event.target.value)">
			</div>`,
	mounted: function(){
		this.$refs.markdown.focus();

		autosize(document.querySelectorAll('textarea'));

		eventBus.$on('beforeSave', this.beforeSave );
	},
	methods: {
		beforeSave()
		{
			/* You can do something here before save. Check image and file component */
			this.$emit('saveBlockEvent');
		},
		updatemarkdown(content)
		{
			this.$emit('updateMarkdownEvent', content);
		},
	},
})

bloxeditor.component('markdown-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-pilcrow">
							<use xlink:href="#icon-pilcrow"></use>
						</svg>
					</div>
					<inline-formats>
						<textarea 
							class 		= "iformat opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
							ref 		= "markdown" 
							:value 		= "markdown" 
							:disabled 	= "disabled" 
							@input 		= "updatemarkdown($event.target.value)"
						></textarea>
			  		</inline-formats>
			 	</div>`,
	mounted: function(){
		this.$refs.markdown.focus();

    this.$nextTick(function () {
        autosize(this.$refs.markdown);  // Using $refs directly
    }.bind(this));
    
    /*
		this.$nextTick(function () {
			autosize(document.querySelectorAll('textarea'));
		});
*/
		eventBus.$on('beforeSave', this.beforeSave );
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},
		updatemarkdown(content)
		{
			var emptyline = /^\s*$(?:\r\n?|\n)/gm;
			
			if(content.search(emptyline) > -1)
			{
				this.$emit('updateMarkdownEvent', content.trim());
				this.$emit('saveBlockEvent');
			}
			else
			{
				this.$emit('updateMarkdownEvent', content);
			}
		}
	},
})

bloxeditor.component('headline-component', { 
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-header">
							<use xlink:href="#icon-header"></use>
						</svg>
					</div>
					<button class="absolute w-6 top-0 bottom-0 left-0 border-r-2 border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-teal-500 hover:dark:bg-teal-500 hover:text-stone-50 transition-1" @click.prevent="headlinedown">
						<div class="absolute w-6 top-3 text-center">{{ level }}</div>
					</button>
					<input 
						class 		= "opacity-1 w-full bg-transparent pr-6 pl-10 py-3 outline-none" 
						:class 		= "hlevel" 
						type 		= "text" 
						v-model 	= "compmarkdown" 
						ref 		= "markdown" 
						:disabled 	= "disabled" 
						@input 		= "updatemarkdown">
				</div>`,
	data: function(){
		return {
			level: '',
			hlevel: '',
			compmarkdown: ''
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();
		
		this.compmarkdown = this.markdown;

		if(!this.compmarkdown)
		{
			this.compmarkdown = '## ';
			this.level = '2';
			this.hlevel = 'h2';
		}
		else
		{
			this.level = this.getHeadlineLevel(this.markdown);
			this.hlevel = 'h' + this.level;
		}
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},
		updatemarkdown(event)
		{
			this.level = this.getHeadlineLevel(this.compmarkdown);
			if(this.level > 6)
			{
				this.compmarkdown = '######' + this.compmarkdown.substr(this.level);
				this.level = 6;
			}
			else if(this.level < 2)
			{
				this.compmarkdown = '##' + this.compmarkdown.substr(this.level);
				this.level = 2;
			}
			this.hlevel = 'h' + this.level;

			this.$emit('updateMarkdownEvent', this.compmarkdown);
		},
		headlinedown()
		{
			this.level = this.getHeadlineLevel(this.compmarkdown);
			if(this.level < 6)
			{
				this.compmarkdown = this.compmarkdown.substr(0, this.level) + '#' + this.compmarkdown.substr(this.level);
				this.level = this.level+1;
				this.hlevel = 'h' + this.level;	
			}
			else
			{
				this.compmarkdown = '##' + this.compmarkdown.substr(this.level);
				this.level = 2;
				this.hlevel = 'h2';				
			}

			this.$emit('updateMarkdownEvent', this.compmarkdown);
		},
		getHeadlineLevel(str)
		{
			var count = 0;
			for(var i = 0; i < str.length; i++){
				if(str[i] != '#'){ return count }
				count++;
			}
		  return count;
		},
	},
})

bloxeditor.component('ulist-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-list2">
							<use xlink:href="#icon-list2"></use>
						</svg>
					</div>
					<inline-formats>
						<textarea 
							class  					= "iformat opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
							ref 					= "markdown" 
							:value 					= "markdown" 
							:disabled 				= "disabled" 
							@keyup.enter.prevent 	= "newLine" 
							@input 					= "updatemarkdown($event.target.value)"
						></textarea>
					</inline-formats>
				</div>`,
	data: function(){
		return {
			compmarkdown: ''
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.compmarkdown = this.markdown;
		
		if(this.compmarkdown == '')
		{
			this.compmarkdown = '* ';
		}
		else
		{
			var lines = this.compmarkdown.split("\n");
			var length = lines.length
			var md = '';

			for(i = 0; i < length; i++)
			{
				var clean = lines[i];
				clean = clean.replace(/^- /, '* ');
				clean = clean.replace(/^\+ /, '* ');
				if(i == length-1)
				{
					md += clean;
				}
				else
				{
					md += clean + '\n';
				}
			}
			this.compmarkdown = md;
		}

		this.$emit('updateMarkdownEvent', this.compmarkdown);

		this.$nextTick(function () {
			autosize(document.querySelectorAll('textarea'));
		});

		this.$refs.markdown.focus();
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},
		updatemarkdown(value)
		{
			this.$emit('updateMarkdownEvent', value);
		},
		newLine(event)
		{
			this.compmarkdown = this.markdown;

			let listend = '* \n'; // '1. \n';
			let liststyle = '* '; // '1. ';
			
			if(this.compmarkdown.endsWith(listend))
			{
				this.compmarkdown = this.compmarkdown.replace(listend, '');
				this.$emit('updateMarkdownEvent', this.compmarkdown);
				this.$emit('saveBlockEvent');
			}
			else
			{
				let mdtextarea 		= document.getElementsByTagName('textarea');
				let start 			= mdtextarea[0].selectionStart;
				let end 			= mdtextarea[0].selectionEnd;
				
				this.compmarkdown 	= this.compmarkdown.substr(0, end) + liststyle + this.compmarkdown.substr(end);

				this.$emit('updateMarkdownEvent', this.compmarkdown);

				mdtextarea[0].focus();
				if(mdtextarea[0].setSelectionRange)
				{
					setTimeout(function(){
					//	var spacer = (this.componentType == "ulist-component") ? 2 : 3;
						mdtextarea[0].setSelectionRange(end+2, end+2);
					}, 1);
				}
			}
		},
	}
})

bloxeditor.component('olist-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-list-numbered">
							<use xlink:href="#icon-list-numbered"></use>
						</svg>
					</div>
					<inline-formats>
						<textarea 
							class 					="iformat opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
							ref 					="markdown" 
							:value 					="markdown" 
							:disabled 				="disabled" 
							@keyup.enter.prevent 	="newLine" 
							@input 					="updatemarkdown($event.target.value)"
						></textarea>
					</inline-formats>
				</div>`,
	data: function(){
		return {
			compmarkdown: ''
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.compmarkdown = this.markdown;

		if(this.compmarkdown == '')
		{
			this.compmarkdown = '1. ';
		}

		this.$emit('updateMarkdownEvent', this.compmarkdown);

		this.$nextTick(function () {
			autosize(document.querySelectorAll('textarea'));
		});

		this.$refs.markdown.focus();
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		updatemarkdown(value)
		{
			this.$emit('updateMarkdownEvent', value);
		},
		newLine(event)
		{
			this.compmarkdown = this.markdown;

			let listend = '1. \n';
			let liststyle = '1. ';
			
			if(this.compmarkdown.endsWith(listend))
			{
				this.compmarkdown = this.compmarkdown.replace(listend, '');
				this.$emit('updateMarkdownEvent', this.compmarkdown);
				this.$emit('saveBlockEvent');
			}
			else
			{
				let mdtextarea 		= document.getElementsByTagName('textarea');
				let start 			= mdtextarea[0].selectionStart;
				let end 			= mdtextarea[0].selectionEnd;
				
				this.compmarkdown 	= this.compmarkdown.substr(0, end) + liststyle + this.compmarkdown.substr(end);

				this.$emit('updateMarkdownEvent', this.compmarkdown);

				mdtextarea[0].focus();
				if(mdtextarea[0].setSelectionRange)
				{
					setTimeout(function(){
						mdtextarea[0].setSelectionRange(end+3, end+3);
					}, 1);
				}
			}
		},		
	},
})

bloxeditor.component('code-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div> 
				<div class="absolute top-3 -left-5 text-stone-400">
					<svg class="icon icon-embed">
						<use xlink:href="#icon-embed"></use>
					</svg>
				</div>
				<div class="w-full flex p-3 border-b-2 border-stone-700 bg-stone-100 dark:bg-stone-900">
				  <label class="pr-2 py-1" for="language">{{ $filters.translate('Language') }}: </label> 
				  <input class="px-2 py-1 flex-grow focus:outline-none bg-stone-200 text-stone-900" name="language" type="text" v-model="language" :disabled="disabled" @input="createlanguage">
				</div>
				<textarea 
					class 		= "font-mono text-sm opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
					ref 		= "markdown" 
					v-model 	= "codeblock" 
					:disabled 	= "disabled" 
					@input 		= "createmarkdown"
				></textarea>
			</div>`,
	data: function(){
		return {
			prefix: '```',
			language: '',
			codeblock: '',
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();

		if(this.markdown)
		{
			var codelines 	= this.markdown.split(/\r\n|\n\r|\n|\r/);
			var linelength 	= codelines.length;
			var codeblock	= '';

			for(i=0;i<linelength;i++)
			{
				if(codelines[i].substring(0,3) == '```')
				{
					if(i==0)
					{
						var prefixlength	= (codelines[i].match(/`/g)).length;
						this.prefix 		= codelines[i].slice(0, prefixlength);
						this.language 		= codelines[i].replace(/`/g, '');
					}
				}
				else
				{
					this.codeblock += codelines[i] + "\n";
				}
			}
			this.codeblock = this.codeblock.replace(/^\s+|\s+$/g, '');
		}
		this.$nextTick(function () {
			autosize(document.querySelectorAll('textarea'));
		//	this.$parent.setComponentSize();
		});	
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		createlanguage()
		{
			var codeblock = this.prefix + this.language + '\n' + this.codeblock + '\n' + this.prefix;
			this.updatemarkdown(codeblock);
		},
		createmarkdown(event)
		{
			this.codeblock = event.target.value;
			var codeblock = this.prefix + this.language + '\n' + this.codeblock + '\n' + this.prefix;
			this.updatemarkdown(codeblock);
		},
		updatemarkdown(codeblock)
		{
			this.$emit('updateMarkdownEvent', codeblock);
		},
	},
})

bloxeditor.component('hr-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-pagebreak">
							<use xlink:href="#icon-pilcrow"></use>
						</svg>
					</div>
					<textarea 
						class 		= "opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
						ref 		= "markdown" 
						:value 		= "markdown" 
						:disabled 	= "disabled" 
						@input 		= "updatemarkdown"
					></textarea>
				</div>`,
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();

		autosize(document.querySelectorAll('textarea'));
		
		this.$emit('updateMarkdownEvent', '---');
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		updatemarkdown(event)
		{
			var emptyline = /^\s*$(?:\r\n?|\n)/gm;
			
			if(event.target.value.search(emptyline) > -1)
			{
				this.$emit('updateMarkdownEvent', event.target.value.trim());
				this.$emit('saveBlockEvent');
			}

			this.$emit('updateMarkdownEvent', event.target.value);
		},
	},
})

bloxeditor.component('toc-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-list-alt">
							<use xlink:href="#icon-list-alt"></use>
						</svg>
					</div>
					<textarea 
						class 		= "opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
						ref 		= "markdown" 
						:value 		= "markdown" 
						:disabled 	= "disabled" 
						@input 		= "updatemarkdown"
					></textarea>
				</div>`,
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();

		autosize(document.querySelectorAll('textarea'));

		this.$emit('updateMarkdownEvent', '[TOC]');
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		updatemarkdown(event)
		{
			var emptyline = /^\s*$(?:\r\n?|\n)/gm;
			
			if(event.target.value.search(emptyline) > -1)
			{
				this.$emit('updateMarkdownEvent', event.target.value.trim());
				this.$emit('saveBlockEvent');
			}

			this.$emit('updateMarkdownEvent', event.target.value);
		},
	},
})


bloxeditor.component('quote-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-quotes-left">
							<use xlink:href="#icon-quotes-left"></use>
						</svg>
					</div>
					<inline-formats>
						<textarea 
							class 					= "iformat opacity-1 w-full bg-transparent px-6 py-3 outline-none" 
							ref 					="markdown" 
							:value 					="markdown" 
							:disabled 				="disabled" 
							@keyup.enter.prevent 	="newLine" 
							@input 					="updatemarkdown($event.target.value)"
						></textarea>
					</inline-formats>
				</div>`,
	data: function(){
		return {
			compmarkdown: ''
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.compmarkdown = this.markdown;

		if(this.compmarkdown == '')
		{
			this.compmarkdown = '> ';
		}

		this.$emit('updateMarkdownEvent', this.compmarkdown);

		this.$nextTick(function () {
			autosize(document.querySelectorAll('textarea'));
		});

		this.$refs.markdown.focus();
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		updatemarkdown(value)
		{
			this.$emit('updateMarkdownEvent', value);
		},
		newLine(event)
		{
			this.compmarkdown = this.markdown;

			let listend = '> \n';
			let liststyle = '> ';
			
			if(this.compmarkdown.endsWith(listend))
			{
				this.compmarkdown = this.compmarkdown.replace(listend, '');
				this.$emit('updateMarkdownEvent', this.compmarkdown);
				this.$emit('saveBlockEvent');
			}
			else
			{
				let mdtextarea 		= document.getElementsByTagName('textarea');
				let start 			= mdtextarea[0].selectionStart;
				let end 			= mdtextarea[0].selectionEnd;
				
				this.compmarkdown 	= this.compmarkdown.substr(0, end) + liststyle + this.compmarkdown.substr(end);

				this.$emit('updateMarkdownEvent', this.compmarkdown);

				mdtextarea[0].focus();
				if(mdtextarea[0].setSelectionRange)
				{
					setTimeout(function(){
						mdtextarea[0].setSelectionRange(end+3, end+3);
					}, 1);
				}
			}
		}
	}
})

bloxeditor.component('notice-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-exclamation-circle">
							<use xlink:href="#icon-exclamation-circle"></use>
						</svg>
					</div>
					<button class="absolute w-6 top-0 bottom-0 left-0 border-r-2 border-stone-700 bg-stone-200 dark:bg-stone-600 hover:bg-teal-500 hover:dark:bg-teal-500 hover:text-stone-50 transition-1" :class="noteclass" @click.prevent="noticedown">
						<div class="absolute w-6 top-3 text-center">{{ prefix }}</div>
					</button>
					<textarea 
						class 		= "opacity-1 w-full bg-transparent pr-6 pl-10 py-3 outline-none notice" 
						ref 		= "markdown" 
						v-model 	= "notice" 
						:disabled 	= "disabled" 
						@input 		= "updatemarkdown($event.target.value)"
					></textarea>
				</div>`,
	data: function(){
		return {
			prefix: '!',
			notice: '',
			noteclass: 'note1'
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();

		if(this.markdown)
		{
			this.prefix = this.getNoticePrefix(this.markdown);

			var lines = this.markdown.match(/^.*([\n\r]+|$)/gm);
			for (var i = 0; i < lines.length; i++)
			{
			    lines[i] = lines[i].replace(/(^[\! ]+(?!\[))/mg, '');
			}

			this.notice = lines.join('');
			this.noteclass = 'note'+this.prefix.length;
		}
		this.$nextTick(function () {
			autosize(document.querySelectorAll('textarea'));
		});
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		noticedown()
		{
			this.prefix = this.getNoticePrefix(this.markdown);
			
			/* initially it is empty string, so we add it here if user clicks downgrade button */
			if(this.prefix == '')
			{
				this.prefix = '!';
			}

			this.prefix = this.prefix + '!';
			if(this.prefix.length > 4)
			{
				this.prefix = '!';
			}
			this.noteclass = 'note' + (this.prefix.length);
			this.updatemarkdown(this.notice);
		},
		getNoticePrefix(str)
		{
			var prefix = '';
			if(str === undefined)
			{
				return prefix;
			}
			for(var i = 0; i < str.length; i++)
			{
				if(str[i] != '!'){ return prefix }
				prefix += '!';
			}
		  return prefix;
		},
		updatemarkdown(value)
		{
			this.notice = value;			

			var lines = value.match(/^.*([\n\r]|$)/gm);

			var notice = this.prefix + ' ' + lines.join(this.prefix+' ');

			this.$emit('updateMarkdownEvent', notice);
		}
	},
})

bloxeditor.component('table-component', { 
	props: ['markdown', 'disabled', 'index'],
	data: function(){
		return {
			table: [
				['0', '1', '2'],
				['1', 'Head', 'Head'],
				['2', 'cell', 'cell'],
				['3', 'cell', 'cell'],
			],
			aligns: ['0', 'left', 'left'],
			editable: 'editable',
			noteditable: 'noteditable',
			cellcontent: '',
			columnbar: false,
			rowbar: false,
			tablekey: 1,
		}
	},
	template: `<div ref="table" :key="tablekey">
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-table2">
							<use xlink:href="#icon-table2"></use>
						</svg>
					</div>
					<table ref="markdown" class="w-full ">
						<colgroup>
							<col v-for="col,index in table[0]" :width="index == 0 ? '40px' : ''">
						</colgroup>
						<tbody>
							<tr v-for="(row, rowindex) in table">
								<td 
									v-if 					= "rowindex === 0" 
									v-for 					= "(value,colindex) in row" 
									contenteditable 		= "false" 
									@click.prevent 			= "switchcolumnbar($event, value)"  
									:class 					= "colindex === 0 ? '' : 'hover:bg-stone-200 cursor-pointer transition-1'" 
									class 					= "border border-stone-300 text-center text-stone-500"
								>{{value}} 
							  		<div v-if="columnbar === value" class="absolute z-20 w-32 text-left text-xs text-white bg-stone-700 transition-1">
								 		<div class="flex justify-between">
									 		<div class="p-2 hover:bg-teal-500 text-left w-32" @click="aligncolumn($event, value, 'left')">:---</div>
									 		<div class="p-2 hover:bg-teal-500 text-center w-32" @click="aligncolumn($event, value, 'center')">:---:</div>
									 		<div class="p-2 hover:bg-teal-500 text-right w-32" @click="aligncolumn($event, value, 'right')">---:</div>
								 		</div>
								 		<div class="p-2 hover:bg-teal-500" @click="addleftcolumn($event, value)">{{ $filters.translate('add left column') }}</div>
							     		<div class="p-2 hover:bg-teal-500" @click="addrightcolumn($event, value)">{{ $filters.translate('add right column') }}</div>
								 		<div class="p-2 hover:bg-teal-500" @click="deletecolumn($event, value)">{{ $filters.translate('delete column') }}</div>
							  		</div>
								</td>
								<th 
									v-if 					= "rowindex === 1" 
									v-for 					= "(value,colindex) in row" 
									:contenteditable 		= "colindex !== 0 ? true : false" 
									@click.prevent 			= "switchrowbar($event, value)" 
									@blur.prevent 			= "updatedata($event,colindex,rowindex)"
									:class 					= "colindex !== 0 ? 'text-center' : 'font-normal text-stone-500' "
									class 					= "p-2 border border-stone-300"
								>{{ value }}
								</th>
								<td 
									v-if 					= "rowindex > 1" 
									v-for 					= "(value,colindex) in row" 
									:contenteditable 		= "colindex !== 0 ? true : false" 
									@click.prevent 			= "switchrowbar($event, value)" 
									@blur.prevent 			= "updatedata($event,colindex,rowindex)"
									:class 					= "colindex !== 0 ? '' : 'text-center text-stone-500 cursor-pointer hover:bg-stone-200'"
									class 					= "p-2 border border-stone-300"
								>
							 		<div v-show="colindex === 0 && rowbar === value" class="rowaction absolute z-20 left-12 w-32 text-left text-xs text-white bg-stone-700">
  										<div class="actionline p-2 hover:bg-teal-500" @click.prevent="addaboverow($event, value)">{{ $filters.translate('add row above') }}</div>
										<div class="actionline p-2 hover:bg-teal-500" @click.prevent="addbelowrow($event, value)">{{ $filters.translate('add row below') }}</div>
										<div class="actionline p-2 hover:bg-teal-500" @click.prevent="deleterow($event, value)">{{ $filters.translate('delete row') }}</div>
									</div>
									{{ value }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>`,
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();
		
		if(this.markdown)
		{
			this.generateTable(this.markdown);
		}
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},
		generateTable(markdown)
		{
			var newtable = [];
			var lines = markdown.split("\n");
			var length = lines.length
			var c = 1;
			
			for(i = 0; i < length; i++)
			{
				if(i == 1)
				{
					this.aligns = [0];
					var line = lines[i].trim();
					var columns = line.split("|");
					for(x = 0; x < columns.length; x++)
					{
						switch(columns[x].trim())
						{
							case "":
							break;
							case ":---:":
								this.aligns[x] = "center";
							break;
							case "---:":
								this.aligns[x] = "right";
							break;
							default: 
								this.aligns[x] = "left";
						}
					}
					continue; 	
				}

				var line = lines[i].trim();
				var row = line.split("|").map(function(cell)
				{
					return cell.trim();
				});
				if(row[0] == ''){ row.shift() }
				if(row[row.length-1] == ''){ row.pop() }
				if(i == 0)
				{
					var rlength = row.length;
					var row0 = [];
					for(y = 0; y <= rlength; y++) { row0.push(y) }
					newtable.push(row0);
				}
				row.splice(0,0,c);
				c++;
				newtable.push(row);
			}
			this.table = newtable;

			this.$forceUpdate();
		},
		enter()
		{
			return false;
		},
		updatedata(event,col,row)
		{
		    const currentContent = this.table[row][col].trim().replace(/\u00A0/g, ' ').normalize();
		    
		    const newContent = event.target.innerText.trim().replace(/\u00A0/g, ' ').normalize();

		    if (newContent !== currentContent)
		    {
        		this.table[row][col] = newContent;
	       		this.markdowntable();
    		}
		},
		updatedataPaste(event,col,row)
		{
			return;
		},
		switchcolumnbar(event, value)
		{
			this.rowbar = false;
			(this.columnbar == value || value == 0) ? this.columnbar = false : this.columnbar = value;
		},
		switchrowbar(event, value)
		{
			this.columnbar = false;
			(this.rowbar == value || value == 0 || value == 1 ) ? this.rowbar = false : this.rowbar = value;
		},
		addaboverow(event, index)
		{
			var row = [];
			var cols = this.table[0].length;
			for(var i = 0; i < cols; i++){ row.push("new"); }
			this.table.splice(index,0,row);
			this.markdowntable();
		},
		addbelowrow(event, index)
		{
			var row = [];
			var cols = this.table[0].length;
			for(var i = 0; i < cols; i++){ row.push("new"); }
			this.table.splice(index+1,0,row);
			this.markdowntable();
		},
		deleterow(event, index)
		{
			this.table.splice(index,1);
			this.markdowntable();
		},
		addrightcolumn(event, index)
		{
			var tableLength = this.table.length;
			for (var i = 0; i < tableLength; i++)
			{
				this.table[i].splice(index+1,0,"new");
			}
			this.markdowntable();
		},
		aligncolumn(event, index, align)
		{
			this.aligns.splice(index,1,align);
			this.markdowntable();
		},
		addleftcolumn(event, index)
		{
			var tableLength = this.table.length;
			for (var i = 0; i < tableLength; i++)
			{
				this.table[i].splice(index,0,"new");
			}
			this.markdowntable();
		},
		deletecolumn(event, index)
		{
			var tableLength = this.table.length;
			for (var i = 0; i < tableLength; i++)
			{
				this.table[i].splice(index,1);
			}
			this.markdowntable();
		},
		markdowntable()
		{
			var compmarkdown = '';
			var separator = '\n|';
			var rows = this.table.length;
			var cols = this.table[0].length;
			
			for(var i = 0; i < cols; i++)
			{
				if(i == 0){ continue; }

				switch(this.aligns[i])
				{
					case "left":
						separator += ':---|';
					break
					case "center":
						separator += ':---:|';
					break
					case "right":
						separator += '---:|';
					break
					default:
						separator += '---|';						
				}
			}
			
			for(var i = 0; i < rows; i++)
			{
				var row = this.table[i];

				if(i == 0){ continue; }
				
				for(var y = 0; y < cols; y++)
				{
					if(y == 0){ continue; }
					
					var value = row[y].trim();
					
					if(y == 1)
					{
						compmarkdown += '\n| ' + value + ' | ';
					}
					else
					{
						compmarkdown += value + ' | ';
					}
				}
				if(i == 1) { compmarkdown = compmarkdown + separator; }
			}

			compmarkdown = compmarkdown.trim();

			this.$emit('updateMarkdownEvent', compmarkdown);

			this.generateTable(compmarkdown);
		},
	},
})

bloxeditor.component('definition-component', {
	props: ['markdown', 'disabled', 'index', 'load'],
	data: function(){
		return {
			definitionList: [],
		}
	},
	template: `<div class="definitionList dark:border dark:border-stone-600">
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-dots-two-vertical">
							<use xlink:href="#icon-dots-two-vertical"></use>
						</svg>
					</div>
					<draggable 
						v-model="definitionList" 
						item-key="id" 
						@end="moveDefinition">
							<template #item="{element, index}">
    							<div class="definitionRow border-b border-stone-300 dark:border-stone-600">
    								<div class="relative flex p-6">
										<div class="definitionTerm"> 
											<input type="text" class="p-2 w-100 text-stone-900 bg-stone-200 focus:outline-none" :placeholder="element.term" :value="element.term" :disabled="disabled" @input="updateterm($event,index)" @blur="updateMarkdown">
						  		  		</div>
						  		  		<div class="flex-grow">
							  		  		<div class="flex mb-2" v-for="(description,ddindex) in element.descriptions">
								  		  		<svg class="icon icon-dots-two-vertical mt-3"><use xlink:href="#icon-dots-two-vertical"></use></svg> 
							  					<textarea class="flex-grow p-2 focus:outline-none bg-stone-200 text-stone-900" :placeholder="description" v-html="element.descriptions[ddindex]" :disabled="disabled" @input="updatedescription($event, index, ddindex)" @keydown.13.prevent="enter" @blur="updateMarkdown"></textarea>
								  				<button title="{{ $filters.translate('delete description') }}" class="text-white bg-stone-700 w-6 h-6 text-xs hover:bg-rose-500" @click.prevent="deleteItem($event,index,ddindex)">
								  					<svg class="icon icon-minus">
								  						<use xlink:href="#icon-minus"></use>
								  					</svg>
								  				</button>
							  				</div>
							  				<button title="add description" class="text-white bg-stone-700 w-6 h-6 text-xs hover:bg-teal-500 ml-4 mr-2" @click.prevent="addItem($event,index)">
								  				<svg class="icon icon-plus">
								  					<use xlink:href="#icon-plus"></use>
								  				</svg>
								  			</button>
								  			<span class="text-sm">{{ $filters.translate('Add description') }}</span>
						  				</div>
									</div>
    							</div>
							</template>
					</draggable>
					<div class="p-6">
		  				<button title="add definition" class="text-white bg-stone-700 w-6 h-6 text-xs hover:bg-teal-500 mr-2" @click.prevent="addDefinition">
			  				<svg class="icon icon-plus"><use xlink:href="#icon-plus"></use></svg>
			  			</button>
						<span class="text-sm">{{ $filters.translate('Add definition') }}</span>
						<div v-if="load" class="loadwrapper"><span class="load"></span></div>
					</div>
				</div>`,
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		if(this.markdown)
		{
			var definitionList		= this.markdown.replace("\r\n", "\n");
			definitionList 			= definitionList.replace("\r", "\n");
			definitionList 			= definitionList.split("\n\n");

			for(var i=0; i < definitionList.length; i++)
			{
				var definitionBlock 		= definitionList[i].split("\n");
				var term 					= definitionBlock[0];
				var descriptions 			= [];
				var description 			= false;

				if(term.trim() == '')
				{
					continue;
				}

				/* parse one or more descriptions */
				for(var y=0; y < definitionBlock.length; y++)
				{
					if(y == 0)
					{
						continue;
					}
					
					if(definitionBlock[y].substring(0, 2) == ": ")
					{
						/* if there is another description in the loop, then push that first then start a new one */
						if(description)
						{
							descriptions.push(description);
						}
						var cleandefinition = definitionBlock[y].substr(1).trim();
						var description = cleandefinition;
					}
					else
					{
						description += "\n" + definitionBlock[y];
					}
				}

				if(description)
				{
					descriptions.push(description);
				}
				this.definitionList.push({'term': term ,'descriptions': descriptions, 'id': i});					
			}
		}
		else
		{
			this.addDefinition();
		}
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},		
		enter()
		{
			return false;
		},
		updateterm(event, dtindex)
		{
			let content = event.target.value.trim();
			if(content != '')
			{
				this.definitionList[dtindex].term = content;
			}
		},
		updatedescription(event, dtindex, ddindex)
		{
			let content = event.target.value.trim();
			if(content != '')
			{
				this.definitionList[dtindex].descriptions[ddindex] = content;
			}
		},
		addDefinition()
		{
			var id = this.definitionList.length;
			this.definitionList.push({'term': '', 'descriptions': [''], 'id': id});
		},
		deleteDefinition(event,dtindex)
		{
			this.definitionList.splice(dtindex,1);
			this.updateMarkdown();
		},
		addItem(event,dtindex)
		{
			this.definitionList[dtindex].descriptions.push('');
		},
		deleteItem(event,dtindex,ddindex)
		{
			if(this.definitionList[dtindex].descriptions.length == 1)
			{
				this.deleteDefinition(false,dtindex);
			}
			else
			{
				this.definitionList[dtindex].descriptions.splice(ddindex,1);
				this.updateMarkdown();
			}
		},
		moveDefinition(evt)
		{
			this.updateMarkdown();
		},
		updateMarkdown()
		{
			var dllength = this.definitionList.length;
			var markdown = '';

			for(i = 0; i < dllength; i++)
			{
				let term = this.definitionList[i].term;
				if(term != '')
				{
					markdown = markdown + term;
					var ddlength 	= this.definitionList[i].descriptions.length;
					for(y = 0; y < ddlength; y++)
					{
						let description = this.definitionList[i].descriptions[y];
						if(description != '')
						{
							markdown = markdown + "\n:   " + description;
						}
					}
					markdown = markdown + "\n\n";
				}
			}
			this.$emit('updateMarkdownEvent', markdown);
		},
	},
})

bloxeditor.component('inline-formats', {
	template: `<div>
				<div :style="styleObject" @mousedown.prevent="" v-show="showInlineFormat" id="formatBar" class="inlineFormatBar">
					<div v-if="link" id="linkBar">
				    	<input v-model="url" @keyup.enter="formatLink" ref="urlinput" class="urlinput" type="text" placeholder="insert url">
						<span class="inlineFormatItem inlineFormatLink" @mousedown.prevent="formatLink">
							<svg class="icon icon-check">
								<use xlink:href="#icon-check"></use>
							</svg>
						</span>
						<span class="inlineFormatItem inlineFormatLink" @mousedown.prevent="closeLink">
							<svg class="icon icon-cross">
								<use xlink:href="#icon-cross"></use>
							</svg>
						</span>
					</div>
					<div v-else>
						<span class="inlineFormatItem" @mousedown.prevent="formatBold">
							<svg class="icon icon-bold">
								<use xlink:href="#icon-bold"></use>
							</svg>
						</span>
						<span class="inlineFormatItem" @mousedown.prevent="formatItalic">
							<svg class="icon icon-italic">
								<use xlink:href="#icon-italic"></use>
							</svg>
						</span> 
						<span class="inlineFormatItem" @mousedown.prevent="openLink">
							<svg class="icon icon-link">
								<use xlink:href="#icon-link"></use>
							</svg>
						</span>
						<span v-if="code" class="inlineFormatItem" @mousedown.prevent="formatCode">
							<svg class="icon icon-embed">
								<use xlink:href="#icon-embed"></use>
							</svg>
						</span>
						<span v-if="math" class="inlineFormatItem" @mousedown.prevent="formatMath">
							<svg class="icon icon-omega">
								<use xlink:href="#icon-omega"></use>
							</svg>
						</span>
				 	</div> 
				</div>
				<slot></slot>
			</div>`,
	data: function(){
		return {
			formatBar: false,
			formatElements: 0,
			startX: 0,
			startY: 0,
     		x: 0,
     		y: 0,
     		z: 150,
     		textComponent: '',
     		selectedText: '',
     		startPos: false,
     		endPos: false,
     		showInlineFormat: false,
     		link: false,
     		stopNext: false,
     		url: '',
     		code: (formatConfig.indexOf("code") > -1) ? true : false,
     		math: (formatConfig.indexOf("math") > -1) ? true : false,
     	}
	},
	mounted: function() {
		this.formatBar = document.getElementById('formatBar');
		window.addEventListener('mouseup', this.onMouseup),
		window.addEventListener('mousedown', this.onMousedown)
	},
	beforeDestroy: function() {
		window.removeEventListener('mouseup', this.onMouseup),
		window.removeEventListener('mousedown', this.onMousedown)
	},
	computed: {
		styleObject() {
			return {
				'left': this.x + 'px', 
				'top': this.y + 'px', 
				'width': this.z + 'px'
			}
	    },
		highlightableEl: function () {
			return this.$slots.default[0].elm  
		}
	},
	methods: {
		onMousedown(event) {
			this.startX = event.offsetX;
			this.startY = event.offsetY;
		},
		onMouseup(event) {

			/* if click is on format popup */
			if(this.formatBar.contains(event.target) || this.stopNext)
			{
				this.stopNext = false;
				return;
			}

			/* if click is outside the textarea *
			if(!this.highlightableEl.contains(event.target))
			{
		  		this.showInlineFormat = false;
		  		this.link = false;
		  		return;
			}
			*/

			this.textComponent = document.getElementsByClassName("iformat")[0];
			if(typeof this.textComponent == "undefined")
			{
				return;
			}

			/* grab the selected text */
			if (document.selection != undefined)
			{
		    	this.textComponent.focus();
		    	var sel = document.selection.createRange();
		    	selectedText = sel.text;
		  	}
		  	/* Mozilla version */
		  	else if (this.textComponent.selectionStart != undefined)
		  	{
		    	this.startPos = this.textComponent.selectionStart;
		    	this.endPos = this.textComponent.selectionEnd;
		    	selectedText = this.textComponent.value.substring(this.startPos, this.endPos)
		  	}

		  	var trimmedSelection = selectedText.replace(/\s/g, '');

		  	if(trimmedSelection.length == 0)
		  	{
		  		this.showInlineFormat = false;
		  		this.link = false;
		  		return;
		  	}

		  	/* determine the width of selection to position the format bar */
		  	if(event.offsetX > this.startX)
		  	{
		  		var width = event.offsetX - this.startX;
		  		this.x = event.offsetX - (width/2);
		  	}
		  	else
		  	{
		  		var width = this.startX - event.offsetX;
		  		this.x = event.offsetX + (width/2);
		  	}

		  	this.y = event.offsetY - 15;

		  	/* calculate the width of the format bar */
			this.formatElements = document.getElementsByClassName('inlineFormatItem').length;
			this.z = this.formatElements * 30;

			this.showInlineFormat = true;
			this.selectedText = selectedText;
		},
		formatBold()
		{
			content = this.textComponent.value;
			content = content.substring(0, this.startPos) + '**' + this.selectedText + '**' + content.substring(this.endPos, content.length);
			eventBus.$emit('inlineFormat', content);
		  	this.showInlineFormat = false;			
			this.$nextTick(function () {
				autosize.update(document.querySelectorAll('textarea'));
			});
		},
		formatItalic()
		{
			content = this.textComponent.value;
			content = content.substring(0, this.startPos) + '_' + this.selectedText + '_' + content.substring(this.endPos, content.length);
			eventBus.$emit('inlineFormat', content);
		  	this.showInlineFormat = false;
			this.$nextTick(function () {
				autosize.update(document.querySelectorAll('textarea'));
			});
		},
		formatCode()
		{
			content = this.textComponent.value;
			content = content.substring(0, this.startPos) + '`' + this.selectedText + '`' + content.substring(this.endPos, content.length);
			eventBus.$emit('inlineFormat', content);
		  	this.showInlineFormat = false;						
			this.$nextTick(function () {
				autosize.update(document.querySelectorAll('textarea'));
			});
		},
		formatMath()
		{
			content = this.textComponent.value;
			content = content.substring(0, this.startPos) + '$' + this.selectedText + '$' + content.substring(this.endPos, content.length);
			eventBus.$emit('inlineFormat', content);
		  	this.showInlineFormat = false;			
			this.$nextTick(function () {
				autosize.update(document.querySelectorAll('textarea'));
			});
		},
		formatLink()
		{
			if(this.url == "")
			{
				this.stopNext = true;
				this.link = false;
			  	this.showInlineFormat = false;
				return;
			}
			content = this.textComponent.value;
			content = content.substring(0, this.startPos) + '[' + this.selectedText + '](' + this.url + ')' + content.substring(this.endPos, content.length);
			eventBus.$emit('inlineFormat', content);
		  	this.showInlineFormat = false;
		  	this.link = false;
			this.$nextTick(function () {
				autosize.update(document.querySelectorAll('textarea'));
			});
		},
		openLink()
		{
			this.link = true;
			this.url = '';
			this.z = 200;
			this.$nextTick(() => this.$refs.urlinput.focus());
		},
		closeLink()
		{
			this.stopNext = true;
			this.link = false;
			this.url = '';
		  	this.showInlineFormat = false;
		}
	}
})

bloxeditor.component('image-component', {
	props: ['markdown', 'disabled', 'index'],
	components: {
		medialib: medialib
	},	
	template: `<div class="dropbox pb-6">
				<input type="hidden" ref="markdown" :value="markdown" :disabled="disabled" @input="updatemarkdown" />
				<div class="flex">
					<div class="imageupload relative w-1/2 border-r border-dotted border-stone-700">
						<input type="file" name="image" accept="image/*" class="opacity-0 w-full h-24 absolute cursor-pointer z-10" @change="onFileChange( $event )" />
						<p class="text-center p-6"><svg class="icon icon-upload"><use xlink:href="#icon-upload"></use></svg> {{ $filters.translate('drag a picture or click to select') }}</p>
					</div>
					<button class="imageselect w-1/2 text-center p-6" @click.prevent="openmedialib()"><svg class="icon icon-image"><use xlink:href="#icon-image"></use></svg> {{ $filters.translate('select from medialib') }}</button>
				</div>

				<Transition name="initial" appear>
					<div v-if="showmedialib" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 dark:bg-stone-700 z-50">
						<button class="w-full bg-stone-200 dark:bg-stone-900 hover:dark:bg-rose-500 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="images" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition> 

				<div class="absolute top-3 -left-5 text-stone-400">
					<svg class="icon icon-image">
						<use xlink:href="#icon-image"></use>
					</svg>
				</div>
				<div class="bg-chess preview-chess w-full mb-4">
					<img class="uploadPreview bg-chess" :src="imgpreview" />
				</div>
				<div v-if="load" class="loadwrapper"><span class="load"></span></div>
				<div class="imgmeta p-8" v-if="imgmeta">
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgsrc">{{ $filters.translate('Source') }}: </label>
						<input class="w-3/5 p-2 bg-stone-200 text-stone-900" name="imgsrc" type="text" placeholder="alt" readonly v-model="imgfile" max="100" />
						<button 
							v-if = "hasSwitchPath()"
							@click = "switchquality" 
							class = "w-1/5 bg-stone-600 hover:bg-stone-900 text-white px-2 py-3 text-center cursor-pointer transition duration-100"
							>switch quality</button>
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgalt">{{ $filters.translate('Alt-Text') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="imgalt" type="text" placeholder="alt" @input="createmarkdown" v-model="imgalt" max="100" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgtitle">{{ $filters.translate('Title') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="imgtitle" type="text" placeholder="title" v-model="imgtitle" @input="createmarkdown" max="64" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgcaption">{{ $filters.translate('Caption') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" title="imgcaption" type="text" placeholder="caption" v-model="imgcaption" @input="createmarkdown" max="140" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgurl">{{ $filters.translate('Link') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" title="imgurl" type="url" placeholder="url" v-model="imglink" @input="createmarkdown" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgclass">{{ $filters.translate('Class') }}: </label>
						<select class="w-4/5 p-2 bg-stone-200 text-stone-900" title="imgclass" v-model="imgclass" @change="createmarkdown">
							<option value="center">{{ $filters.translate('Center') }}</option>
							<option value="left">{{ $filters.translate('Left') }}</option>
							<option value="right">{{ $filters.translate('Right') }}</option>
						</select>
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imgsizes">{{ $filters.translate('width/height') }}:</label>
						<input class="w-2/5 p-2 mr-1 bg-stone-200 text-stone-900" title="imgwidth" type="text" :placeholder="originalwidth" v-model="imgwidth" @input="changewidth" max="6" />
						<input class="w-2/5 p-2 ml-1 bg-stone-200 text-stone-900" title="imgheight" type="text" :placeholder="originalheight" v-model="imgheight" @input="changeheight" max="6" />
					</div>
					<input title="imgid" type="hidden" placeholder="id" v-model="imgid" @input="createmarkdown" max="140" />
				</div></div>`,
	data: function(){
		return {
			compmarkdown: '',
			saveimage: false,
			maxsize: 10, // megabyte
			imgpreview: '',
			showmedialib: false,
			load: false,
			imgmeta: false,
			imgalt: '',
			imgtitle: '',
			imgcaption: '',
			imglink: '',
			imgclass: 'center',
			imgid: '',
			imgwidth: 0,
			imgheight: 0,
			originalwidth: 0,
			originalheight: 0,
			imgloading: 'lazy',
			imgattr: '',
			imgfile: '',
			noresize: false,
			newblock: true,
		}
	},
	mounted: function(){
		
		eventBus.$on('beforeSave', this.beforeSave );

		const maxsize = parseFloat(data?.settings?.maximageuploads);
		if(!isNaN(maxsize) && maxsize > 0)
		{
			this.maxsize = maxsize;
		}

		this.$refs.markdown.focus();

		if(this.markdown)
		{
			this.newblock  			= false;

			this.showresize 		= false;

			this.imgmeta 			= true;
			
			var imgmarkdown 		= this.markdown;

			var imgcaption 			= imgmarkdown.match(/\*.*?\*/);
			if(imgcaption)
			{
				this.imgcaption 	= imgcaption[0].slice(1,-1);
				
				imgmarkdown 		= imgmarkdown.replace(this.imgcaption,'');
				imgmarkdown 		= imgmarkdown.replace(/\r?\n|\r/g,'');			
			}

			if(this.markdown[0] == '[')
			{
				var imglink 			= this.markdown.match(/\(.*?\)/g);
				if(imglink[1])
				{
					this.imglink 		= imglink[1].slice(1,-1);
					
					imgmarkdown 		= imgmarkdown.replace(imglink[1],'');
					imgmarkdown 		= imgmarkdown.slice(1, -1);
				}
			}
						
			var imgalt 				= imgmarkdown.match(/\[.*?\]/);
			if(imgalt)
			{
				this.imgalt 		= imgalt[0].slice(1,-1);
			}
			
			var imgattr 			= imgmarkdown.match(/\{.*?\}/);
			if(imgattr)
			{
				imgattr 			= imgattr[0].slice(1,-1);
				imgattr 			= imgattr.trim();
				imgattr 			= imgattr.split(' ');
				
				var widthpattern 	= /width=\"?([0-9]*)[a-zA-Z%]*\"?/;
				var heightpattern	= /height=\"?([0-9]*)[a-zA-Z%]*\"?/;
				var lazypattern 	= /loading=\"?([0-9a-zA-Z]*)\"?/;

				for (var i = 0; i < imgattr.length; i++)
				{
					var widthattr 		= imgattr[i].match(widthpattern);
					var heightattr 		= imgattr[i].match(heightpattern);
					var lazyattr 		= imgattr[i].match(lazypattern);

					if(imgattr[i].charAt(0) == '.')
					{
						this.imgclass		= imgattr[i].slice(1);
					}
					else if(imgattr[i].charAt(0)  == '#')
					{
						this.imgid 			= imgattr[i].slice(1);
					}
					else if(widthattr)
					{
						this.imgwidth		= parseInt(widthattr[1]);
					}
					else if(heightattr)
					{
						this.imgheight 		= parseInt(heightattr[1]);
					}
					else if(lazyattr && lazyattr[1] != '')
					{
						this.imgloading		= lazyattr[1];
					}
					else
					{
						this.imgattr 		+= ' ' + imgattr[i];
					}
				}
			}

			var imgfile 			= imgmarkdown.match(/\(.*?\)/);
			if(imgfile)
			{
				imgfilestring 		= imgfile[0];
				var imgtitle 		= imgfilestring.match(/\".*?\"/);
				if(imgtitle)
				{
					this.imgtitle 	= imgtitle[0].slice(1,-1);
					imgfilestring 	= imgfilestring.replace(imgtitle[0], '');
				}

				this.imgfile 		= imgfilestring.slice(1,-1).trim();
				this.imgpreview 	= data.urlinfo.baseurl + '/' + this.imgfile;
			}
			
			this.createmarkdown();
		}
	},
	methods: {
		closemedialib()
		{
			this.showmedialib = false;
		},
		addFromMedialibFunction(value)
		{
			this.imgfile 		= value;
			this.imgpreview 	= data.urlinfo.baseurl + '/' + value;
			this.showmedialib 	= false;
			this.saveimage 		= false;
			this.imgmeta 		= true;

			this.createmarkdown();
		},
		updatemarkdown(event)
		{
			this.$emit('updateMarkdownEvent', event.target.value);
		},
		hasSwitchPath()
		{
			if (this.imgfile.startsWith('media/live') || this.imgfile.startsWith('media/original'))
			{
				return true;
			}
			return false;
		},
		switchquality()
		{
			if (this.imgfile.startsWith('media/live'))
			{
				this.imgfile = this.imgfile.replace('media/live', 'media/original');
			}
			else if (this.imgfile.startsWith('media/original'))
			{
				this.imgfile = this.imgfile.replace('media/original', 'media/live');
			}
			this.imgpreview = data.urlinfo.baseurl + '/' + this.imgfile;
			this.imgwidth = 0;
			this.imgheight = 0;
			this.createmarkdown();
		},
		createmarkdown()
		{
			if(this.imgpreview)
			{
				var img = new Image();
				img.src = this.imgpreview;

				var self = this;

				img.onload = function(){

					self.originalwidth 		= img.width;
					self.originalheight 	= img.height;
					self.originalratio 		= self.originalwidth / self.originalheight;

					self.calculatewidth();
					self.calculateheight();
					self.createmarkdownimageloaded();
				}
			}
			else
			{
				this.createmarkdownimageloaded();
			}
		},
		createmarkdownimageloaded()
		{
			var errors = false;
			
			var imgmarkdown = '';

			if(this.imgalt.length < 101)
			{
				imgmarkdown = '![' + this.imgalt + ']';
			}
			else
			{
				errors = this.$filters.translate('Maximum size of image alt-text is 100 characters');
				imgmarkdown = '![]';
			}
			
			if(this.imgtitle != '')
			{
				if(this.imgtitle.length < 101)
				{
					imgmarkdown = imgmarkdown + '(' + this.imgfile + ' "' + this.imgtitle + '")';
				}
				else
				{
					errors = this.$filters.translate('Maximum size of image title is 100 characters');
				}
			}
			else
			{
				imgmarkdown = imgmarkdown + '(' + this.imgfile + ')';		
			}
			
			var imgattr = '';

			if(this.imgid != '')
			{
				if(this.imgid.length < 100)
				{
					imgattr = imgattr + ' #' + this.imgid; 
				}
				else
				{
					errors = this.$filters.translate('Maximum size of image id is 100 characters');
				}
			}
			if(this.imgclass != '')
			{
				if(this.imgclass.length < 100)
				{
					imgattr = imgattr + ' .' + this.imgclass; 
				}
				else
				{
					errors = this.$filters.translate('Maximum size of image class is 100 characters');
				}
			}
			if(this.imgloading != '')
			{
				imgattr = imgattr + ' loading="' + this.imgloading + '"';
			}			
			if(this.imgwidth != '')
			{
				imgattr = imgattr + ' width="' + this.imgwidth + '"';
			}
			if(this.imgheight != '')
			{
				imgattr = imgattr + ' height="' + this.imgheight + '"';
			}			
			if(this.imgattr != '')
			{
				imgattr += this.imgattr;
			}
			if(imgattr != '')
			{
				imgmarkdown = imgmarkdown + '{' + imgattr.trim() + '}';
			}			
			if(this.imglink != '')
			{
				if(this.imglink.length < 101)
				{
					imgmarkdown = '[' + imgmarkdown + '](' + this.imglink + ')';
				}
				else
				{
					errors = this.$filters.translate('Maximum size of image link is 100 characters');
				}
			}
			if(this.imgcaption != '')
			{
				if(this.imgcaption.length < 140)
				{
					imgmarkdown = imgmarkdown + '\n*' + this.imgcaption + '*'; 
				}
				else
				{
					errors = this.$filters.translate('Maximum size of image caption is 140 characters');
				}
			}
			if(errors)
			{
				eventBus.$emit('publishermessage', errors);
			}
			else
			{
				this.compmarkdown = imgmarkdown;

				this.$emit('updateMarkdownEvent', imgmarkdown);
			}
		},
		calculatewidth()
		{
			this.setdefaultsize();
			if(this.imgheight && this.imgheight > 0)
			{
				this.imgwidth = Math.round(this.imgheight * this.originalratio);
			}
			else
			{
				this.imgwidth = '';
			}
		},
		calculateheight()
		{
			this.setdefaultsize();
			if(this.imgwidth && this.imgwidth > 0)
			{
				this.imgheight = Math.round(this.imgwidth / this.originalratio);
			}
			else
			{
				this.imgheight = '';
			}
		},
		setdefaultsize()
		{
			if( 
				(this.imgheight == 0 && this.imgwidth == 0) ||
				(this.imgheight > this.originalheight) ||
				(this.imgwidth > this.originalwidth)
			)
			{
				this.imgwidth = this.originalwidth;
				this.imgheight = this.originalheight;
			}
		},
		changewidth()
		{
			this.calculateheight();
			this.createmarkdownimageloaded();
		},
		changeheight()
		{
			this.calculatewidth();
			this.createmarkdownimageloaded();
		},
		openmedialib()
		{
			this.showresize 	= false;
			this.noresize 		= false;
			this.showmedialib 	= true;
		},
		isChecked(classname)
		{
			if(this.imgclass == classname)
			{
				return ' checked';
			}
		},
		onFileChange( e )
		{
			if(e.target.files.length > 0)
			{
				let imageFile = e.target.files[0];
				let size = imageFile.size / 1024 / 1024;
				
				if (!imageFile.type.match('image.*'))
				{
					let message = this.$filters.translate('Only images are allowed');
					eventBus.$emit('publishermessage', message);
				} 
				else if (size > this.maxsize)
				{
					let message = "The maximal size of images is " + this.maxsize + " MB";
					message = this.$filters.translate(message);
					eventBus.$emit('publishermessage', message);
				}
				else
				{
					self = this;

					self.load 					= true;
					self.showresize 			= true;
					self.noresize 				= false;
					self.imgwidth  				= 0;
					self.imgheight 				= 0;

					let reader = new FileReader();
					reader.readAsDataURL(imageFile);
					reader.onload = function(e) {

						self.imgpreview = e.target.result;

						self.createmarkdown();

					    tmaxios.post('/api/v1/image',{
							'url':				data.urlinfo.route,
							'image':			e.target.result,
							'name': 			imageFile.name, 
						})
					    .then(function (response) {
								
								self.load = false;
								self.saveimage = true;

								self.imgmeta = true;
								self.imgfile = response.data.path;

								if(self.imgwidth > 820)
								{
									self.imgwidth = 820;
									self.calculateheight();
								}
					    })
					    .catch(function (error)
					    {
					      if(error.response)
					      {
					      	let message = error.response.data.message;
							message = self.$filters.translate(message);
							eventBus.$emit('publishermessage', message);
					      }
					    });
					}
				}
			}
		},
		beforeSave()
		{
			/* publish the image before you save the block */

			if(!this.imgfile)
			{
				let message = this.$filters.translate("Imagefile is missing.");
				eventBus.$emit('publishermessage', message);
				return;
			}
			if(!this.saveimage)
			{
				this.$emit('saveBlockEvent');
			}
			else
			{
				var self = this;

		        tmaxios.put('/api/v1/image',{
					'url':			data.urlinfo.route,
					'imgfile': 		this.imgfile,
					'noresize':  	this.noresize
				})
				.then(function (response)
				{
					self.saveimage 	= false;
					self.imgfile 	= response.data.path;

					self.createmarkdownimageloaded();

					self.$emit('saveBlockEvent');
				})
				.catch(function (error)
				{
					if(error.response)
					{
						let message = self.$filters.translate(error.response.data.message);
						eventBus.$emit('publishermessage', message);
					}
				});
			}
		},
	}
})

bloxeditor.component('file-component', {
	props: ['markdown', 'disabled', 'index'],
	components: {
		medialib: medialib
	},	
	template: `<div class="dropbox">
				<input type="hidden" ref="markdown" :value="markdown" :disabled="disabled" @input="updatemarkdown" />
				<div class="flex">
					<div class="imageupload relative w-1/2 border-r border-dotted border-stone-700">
						<input type="file"  name="file" accept="*" class="opacity-0 w-full h-24 absolute cursor-pointer z-10" @change="onFileChange( $event )" />
						<p class="text-center p-6">
							<svg class="icon icon-upload">
								<use xlink:href="#icon-upload"></use>
							</svg> 
							{{ $filters.translate('upload file') }}
						</p>
					</div>
					<button class="imageselect  w-1/2 text-center p-6" @click.prevent="openmedialib()">
						<svg class="icon icon-paperclip baseline">
							<use xlink:href="#icon-paperclip"></use>
						</svg> 
						{{ $filters.translate('select from medialib') }}
					</button>
				</div>

				<Transition name="initial" appear>
					<div v-if="showmedialib" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 z-50">
						<button class="w-full bg-stone-200 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="files" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition>

				<div class="absolute top-3 -left-5 text-stone-400">
					<svg class="icon icon-paperclip">
						<use xlink:href="#icon-paperclip"></use>
					</svg>
				</div>
				<div v-if="load" class="loadwrapper"><span class="load"></span></div>
				<div class="imgmeta p-8" v-if="filemeta">
					<input title="fileid" type="hidden" placeholder="id" v-model="fileid" @input="createmarkdown" max="140" />
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="filetitle">{{ $filters.translate('Title') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="filetitle" type="text" placeholder="Add a title for the download-link" v-model="filetitle" @input="createmarkdown" max="64" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="filerestriction">Access for: </label>
						<select class="w-4/5 p-2 bg-stone-200 text-stone-900" name="filerestriction" v-model="selectedrole" @change="updaterestriction">
							<option disabled value="">{{ $filters.translate('Please select') }}</option>
							<option v-for="role in userroles">{{ role }}</option>
						</select>
					</div>
				</div>
  			</div>`,
	data: function(){
		return {
			maxsize: 20, // megabyte
			showmedialib: false,
			load: false,
			filemeta: false,
			filetitle: '',
			fileextension: '',
			fileurl: '',
			fileid: '',
			userroles: ['all'],
			selectedrole: '',
			savefile: false,
		}
	},
	mounted: function(){
		
		eventBus.$on('beforeSave', this.beforeSave );

		const maxsize = parseFloat(data?.settings?.maxfileuploads);
		if(!isNaN(maxsize) && maxsize > 0)
		{
			this.maxsize = maxsize;
		}

		this.$refs.markdown.focus();

		if(this.markdown)
		{
			this.filemeta = true;
			
			var filemarkdown = this.markdown;
			
			var filetitle = filemarkdown.match(/\[.*?\]/);
			if(filetitle)
			{
				filemarkdown = filemarkdown.replace(filetitle[0],'');
				this.filetitle = filetitle[0].slice(1,-1);
			}

			var fileattr = filemarkdown.match(/\{.*?\}/);
			var fileextension = filemarkdown.match(/file-(.*)?\}/);
			if(fileattr && fileextension)
			{
				filemarkdown = filemarkdown.replace(fileattr[0],'');
				this.fileextension = fileextension[1].trim();
			}

			var fileurl = filemarkdown.match(/\(.*?\)/g);
			if(fileurl)
			{
				filemarkdown = filemarkdown.replace(fileurl[0],'');
				this.fileurl = fileurl[0].slice(1,-1);
			}
		}

		this.getrestriction();
	},
	methods: {
		addFromMedialibFunction(file)
		{
			this.showmedialib 	= false;
			this.savefile 		= false;
			this.fileurl 		= file.url;
			this.filemeta 		= true;
			this.filetitle 		= file.name;
			this.fileextension 	= file.info.extension;

			this.createmarkdown();
			this.getrestriction(file.url);
		},
		openmedialib()
		{
			this.showmedialib = true;
		},
		isChecked(classname)
		{
			if(this.fileclass == classname)
			{
				return ' checked';
			}
		},
		updatemarkdown(event, url)
		{
			this.$emit('updateMarkdownEvent', event.target.value);
			this.getrestriction(url);
		},
		createmarkdown()
		{
			var errors = false;
			
			if(this.filetitle.length < 101)
			{
				filemarkdown = '[' + this.filetitle + ']';
			}
			else
			{
				errors = this.$filters.translate('Maximum size of file-text is 100 characters');
				filemarkdown = '[]';
			}
			if(this.fileurl != '')
			{
				if(this.fileurl.length < 101)
				{
					filemarkdown = '[' + this.filetitle + '](' + this.fileurl + ')';
				}
				else
				{
					errors = this.$filters.translate('Maximum size of file link is 100 characters');
				}
			}
			if(this.fileextension != '')
			{
				filemarkdown = filemarkdown + '{.tm-download file-' + this.fileextension + '}';
			}
			if(errors)
			{
				eventBus.$emit('publishermessage', this.$filters.translate(errors));
			}
			else
			{
				this.$emit('updateMarkdownEvent', filemarkdown);
				this.compmarkdown = filemarkdown;
			}
		},
		getrestriction(url)
		{
			var fileurl = this.fileurl;
			if(url)
			{
				fileurl = url;
			}

			var myself = this;

			tmaxios.get('/api/v1/filerestrictions',{
				params: {
					'url':			data.urlinfo.route,
					'filename': 	fileurl,
		    	}
			})
			.then(function (response) {
				myself.userroles 		= ['all'];
				myself.userroles 		= myself.userroles.concat(response.data.userroles);
				myself.selectedrole		= response.data.restriction;
			})
			.catch(function (error)
			{
				if(error.response.data.message)
				{
					let message = myself.$filters.translate(error.response.data.message);
					eventBus.$emit('publishermessage', message);
				}
			});
		},
		updaterestriction()
		{
			tmaxios.post('/api/v1/filerestrictions',{
				'url':			data.urlinfo.route,
				'filename': 	this.fileurl,
				'role': 		this.selectedrole,
			})
			.then(function (response) {})
			.catch(function (error){ alert("reponse error")});
		},
		onFileChange( e )
		{
			if(e.target.files.length > 0)
			{
				let uploadedFile = e.target.files[0];
				let size = uploadedFile.size / 1024 / 1024;
				
				if (size > this.maxsize)
				{
					let message = "The maximal size of a file is " + this.maxsize + " MB";
					eventBus.$emit('publishermessage', message);
				}
				else
				{
					self = this;
					
					self.load = true;

					let reader = new FileReader();
					reader.readAsDataURL(uploadedFile);
					reader.onload = function(e) {
						
						tmaxios.post('/api/v1/file',{
							'url':				data.urlinfo.route,
							'file':				e.target.result,
							'name': 			uploadedFile.name, 
						})
						.then(function (response) {

							self.load = false;

							self.filemeta 			= true;
							self.savefile 			= true;
							self.filetitle 			= response.data.fileinfo.title;
							self.fileextension 		= response.data.fileinfo.extension;
							self.fileurl 			= response.data.filepath;
							self.selectedrole 		= '';
							
							self.createmarkdown();
				    	})
						.catch(function (error)
						{
							self.load = false;
							if(error.response)
							{
								let message = self.$filters.translate(error.response.data.message);
								eventBus.$emit('publishermessage', message);
							}
						});
					}
				}
			}
		},
		beforeSave()
		{
			/* publish file before you save markdown */

			if(!this.fileurl)
			{
				let message = this.$filters.translate('file is missing.');
				eventBus.$emit('publishermessage', message);

				return;
			}

			if(!this.savefile)
			{
				this.createmarkdown();
				this.$emit('saveBlockEvent');
			}
			else
			{
				var self = this;

		        tmaxios.put('/api/v1/file',{
					'url':			data.urlinfo.route,
					'file': 		this.fileurl,
				})
				.then(function (response)
				{
					self.fileurl = response.data.path;

					self.createmarkdown();

					self.$emit('saveBlockEvent');
				})
				.catch(function (error)
				{
					if(error.response)
					{
						let message = self.$filters.translate(error.response.data.message);
						eventBus.$emit('publishermessage', message);
					}
				});
			}
		},		
	}
})

bloxeditor.component('video-component', {
	props: ['markdown', 'disabled', 'index'],
	components: {
		medialib: medialib
	},
	template: `<div class="dropbox">
				<input type="hidden" ref="markdown" :value="markdown" :disabled="disabled" @input="updatemarkdown" />
				<div class="flex">
					<div class="imageupload relative w-1/2 border-r border-dotted border-stone-700">
						<input type="file"  name="file" accept="video/mp4,video/webm,video/ogg" class="opacity-0 w-full h-24 absolute cursor-pointer z-10" @change="onFileChange( $event )" />
						<p class="text-center p-6">
							<svg class="icon icon-upload">
								<use xlink:href="#icon-upload"></use>
							</svg> 
							{{ $filters.translate('upload video') }}
						</p>
					</div>
					<button class="imageselect w-1/2 text-center p-6" @click.prevent="openmedialib('files')">
						<svg class="icon icon-paperclip baseline">
							<use xlink:href="#icon-paperclip"></use>
						</svg> 
						{{ $filters.translate('select from medialib') }}
					</button>
				</div>

				<Transition name="initial" appear>
					<div v-if="showmedialib == 'files'" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 z-50">
						<button class="w-full bg-stone-200 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="videos" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition>
				<Transition name="initial" appear>
					<div v-if="showmedialib == 'images'" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 z-50">
						<button class="w-full bg-stone-200 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="images" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition>

				<div class="absolute top-3 -left-5 text-stone-400">
					<svg class="icon icon-paperclip">
						<use xlink:href="#icon-paperclip"></use>
					</svg>
				</div>
				<div class="bg-chess preview-chess w-full mb-4 flex items-center justify-center">
					<video
						v-if 		= "fileurl" 
						controls 	= "true" 
						:width 		= "width" 
						:preload 	= "preload"
						:poster 	= "getPoster()"
						:key 		= "preload + fileurl"  
						>
                          <source 
                          	:src = "baseurl + '/' + fileurl" 
                          	:type = "getType()"
                          	>
                    </video>
				</div>
				<div v-if="load" class="loadwrapper"><span class="load"></span></div>
				<div class="imgmeta p-8" v-if="filemeta">
					<input 
						title 		= "fileid" 
						type 		= "hidden" 
						placeholder = "id" 
						v-model 	= "fileid" 
						@input 		= "createmarkdown" 
						max 		= "140" 
						/>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="path">{{ $filters.translate('Path') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="path" type="text" readonly="true" v-model="fileurl" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="width">{{ $filters.translate('Width') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="width" type="text" placeholder="500" v-model="width" @input="createmarkdown" />
					</div>
					<div class="flex mb-2">
					    <label class="w-1/5 py-2" for="videopreload">{{ $filters.translate('Preload') }}: </label>
					    <select class="w-4/5 p-2 bg-stone-200 text-stone-900" name="videopreload" v-model="preload" @change="createmarkdown">
					        <option value="none">none</option>
					        <option value="metadata">metadata</option>
					        <option value="auto">auto</option>
					    </select>
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="imagepath">{{ $filters.translate('Image') }}: </label>
						<div class="flex w-4/5 justify-between">
							<button @click.prevent="deleteImage()" class="w-8 bg-rose-500 dark:bg-stone-600 hover:bg-rose-600 hover:dark:bg-rose-500 text-white">x</button>
							<input class="w-full p-2 bg-stone-200 text-stone-900" name="path" type="text" readonly="true" v-model="imageurl" />
							<button @click.prevent="openmedialib('images')" class="w-8 bg-stone-600 dark:bg-stone-600 hover:bg-stone-800 hover:dark:bg-stone-500 text-white"><svg class="icon icon-image"><use xlink:href="#icon-image"></use></svg></button>
						</div>
					</div>
				</div>
  			</div>`,
	data: function(){
		return {
			maxsize: 20, // megabyte
			showmedialib: false,
			load: false,
			filemeta: false,
			fileextension: '',
			allowedImageExtensions: ['webp', 'png', 'svg', 'jpg', 'jpeg'],
			allowedExtensions: ['mp4', 'webm', 'ogg'],
			fileurl: '',
			baseurl: '',
			width: '500',
			fileid: '',
			imageurl: '',
			savefile: false,
			mediatypes: 'files',
			preload: 'none',
		}
	},
	mounted: function() {
	    eventBus.$on('beforeSave', this.beforeSave);

	    this.baseurl = data.urlinfo.baseurl;

		const maxsize = parseFloat(data?.settings?.maxfileuploads);
		if(!isNaN(maxsize) && maxsize > 0)
		{
			this.maxsize = maxsize;
		}

	    this.$refs.markdown.focus();

	    if (this.markdown) 
	    {
	        this.filemeta = true;

	        var fileurl = this.markdown.match(/path="(.*?)"/);
	        if (fileurl && fileurl[1]) 
	        {
	            this.fileurl = fileurl[1];
	        }

	        var width = this.markdown.match(/width="(.*?)"/);
	        if (width && width[1]) 
	        {
	            this.width = width[1];
	        } 

	        var preload = this.markdown.match(/preload="(.*?)"/);
	        if (preload && preload[1]) 
	        {
	            this.preload = preload[1];
	        } 

	        var poster = this.markdown.match(/poster="(.*?)"/);
	        if (poster && poster[1]) 
	        {
	            this.imageurl = poster[1];
	        } 
	    }
	},
	methods: {
		getType()
		{
			if(this.fileurl)
			{
				const parts = this.fileurl.split('.');
				const extension = parts.pop().toLowerCase();
				extension.split('?')[0];
				return 'video/' + extension;
			}
			return 'video/';
		},
		getPoster()
		{
			if(this.imageurl)
			{
				return this.baseurl + '/' + this.imageurl;
			}
			return false;
		},
		addFromMedialibFunction(file)
		{
		    this.showmedialib  = false;
		    this.savefile      = false;
		    this.filemeta      = true;

		    if (typeof file === 'string')
		    {
		        let fileExtension = file.split('.').pop().toLowerCase();

		        if (this.allowedImageExtensions.includes(fileExtension))
		        {
		            this.imageurl = file;
		        }
		        else 
		        {
		            let message = "Unsupported file type. Please select an image with format webp, png, jpg, jpeg. svg.";
		            eventBus.$emit('publishermessage', message);
		            return;
		        }
		    } 
		    else if (this.allowedExtensions.includes(file.info.extension.toLowerCase()))
		    {
		        this.filetitle    = file.name;
		        this.fileextension = file.info.extension.toLowerCase();
		        this.fileurl       = file.url;
		    }
		    else 
		    {
		        let message = "Unsupported file type. Please select a valid video file (webm, mp4, ogg).";
		        eventBus.$emit('publishermessage', message);
		        return;
		    }

		    this.createmarkdown();
		},
		openmedialib(type)
		{
			this.showmedialib = type;
		},
		deleteImage()
		{
			this.imageurl = '';
		},
		isChecked(classname)
		{
			if(this.fileclass == classname)
			{
				return ' checked';
			}
		},
		updatemarkdown(event, url)
		{
			this.$emit('updateMarkdownEvent', event.target.value);
		},
		createmarkdown()
		{
		    var errors = false;
		    var filemarkdown = false;

		    if (this.fileurl !== '')
		    {
		        if (this.fileurl.length < 101)
		        {
		            var width 	= this.width ? ' width="' + this.width + '"' : '';
		            var preload = this.preload ? ' preload="' + this.preload + '"' : ' preload="none"';
		            var poster 	= this.imageurl ? ' poster="' + this.imageurl + '"' : '';

		            filemarkdown = '[:video path="' + this.fileurl + '"' + width + preload + poster + ' :]';
		        } 
		        else 
		        {
		            errors = this.$filters.translate('Maximum size of file link is 100 characters');
		        }
		    }

		    if (errors) 
		    {
		        eventBus.$emit('publishermessage', this.$filters.translate(errors));
		    } 
		    else if (filemarkdown) 
		    {
		        this.$emit('updateMarkdownEvent', filemarkdown);
		        this.compmarkdown = filemarkdown;
		    }
		},
		onFileChange( e )
		{
			if(e.target.files.length > 0)
			{
				let uploadedFile = e.target.files[0];

		        let allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
		        if (!allowedVideoTypes.includes(uploadedFile.type)) {
		            let message = "Unsupported file type. Please select a video file (mp4, webm, ogg).";
		            eventBus.$emit('publishermessage', message);
		            return;
		        }

				let size = uploadedFile.size / 1024 / 1024;
				
				if (size > this.maxsize)
				{
					let message = "The maximal size of a file is " + this.maxsize + " MB";
					eventBus.$emit('publishermessage', message);
					return;
				}
				else
				{
					self = this;
					
					self.load = true;

					let reader = new FileReader();
					reader.readAsDataURL(uploadedFile);
					reader.onload = function(e) {
						
						tmaxios.post('/api/v1/file',{
							'url':				data.urlinfo.route,
							'file':				e.target.result,
							'name': 			uploadedFile.name, 
						})
						.then(function (response) {

							self.load = false;

							self.filemeta 			= true;
							self.savefile 			= true;
							self.filetitle 			= response.data.fileinfo.title;
							self.fileextension 		= response.data.fileinfo.extension;
							self.fileurl 			= response.data.filepath;
							self.selectedrole 		= '';
							
							self.createmarkdown();
				    	})
						.catch(function (error)
						{
							self.load = false;
							if(error.response)
							{
								let message = self.$filters.translate(error.response.data.message);
								eventBus.$emit('publishermessage', message);
							}
						});
					}
				}
			}
		},
		beforeSave()
		{
			/* publish file before you save markdown */

			if(!this.fileurl)
			{
				let message = this.$filters.translate('file is missing.');
				eventBus.$emit('publishermessage', message);

				return;
			}

		    const fileExtension = this.fileurl.split('.').pop().toLowerCase();

		    if (!this.allowedExtensions.includes(fileExtension))
		    {
		        let message = this.$filters.translate('Unsupported file format. Only MP4, WebM, and OGG files are allowed.');
		        eventBus.$emit('publishermessage', message);
		        
		        return;
		    }

			if(!this.savefile)
			{
				this.createmarkdown();
				this.$emit('saveBlockEvent');
			}
			else
			{
				var self = this;

		        tmaxios.put('/api/v1/file',{
					'url':			data.urlinfo.route,
					'file': 		this.fileurl,
				})
				.then(function (response)
				{
					self.fileurl = response.data.path;

					self.createmarkdown();

					self.$emit('saveBlockEvent');
				})
				.catch(function (error)
				{
					if(error.response)
					{
						let message = self.$filters.translate(error.response.data.message);
						eventBus.$emit('publishermessage', message);
					}
				});
			}
		},		
	}
})

bloxeditor.component('audio-component', {
	props: ['markdown', 'disabled', 'index'],
	components: {
		medialib: medialib
	},
	template: `<div class="dropbox">
				<input type="hidden" ref="markdown" :value="markdown" :disabled="disabled" @input="updatemarkdown" />
				<div class="flex">
					<div class="imageupload relative w-1/2 border-r border-dotted border-stone-700">
						<input type="file"  name="file" accept="audio/mpeg, audio/ogg" class="opacity-0 w-full h-24 absolute cursor-pointer z-10" @change="onFileChange( $event )" />
						<p class="text-center p-6">
							<svg class="icon icon-upload">
								<use xlink:href="#icon-upload"></use>
							</svg> 
							{{ $filters.translate('upload audio') }}
						</p>
					</div>
					<button class="imageselect w-1/2 text-center p-6" @click.prevent="openmedialib('files')">
						<svg class="icon icon-paperclip baseline">
							<use xlink:href="#icon-paperclip"></use>
						</svg> 
						{{ $filters.translate('select from medialib') }}
					</button>
				</div>

				<Transition name="initial" appear>
					<div v-if="showmedialib" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 z-50">
						<button class="w-full bg-stone-200 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="audios" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition>

				<div class="absolute top-3 -left-5 text-stone-400">
					<svg class="icon icon-paperclip">
						<use xlink:href="#icon-paperclip"></use>
					</svg>
				</div>
				<div v-if="load" class="loadwrapper"><span class="load"></span></div>
				<div v-if="fileurl" class="bg-yellow-500 w-full py-5 flex items-center justify-center">
					<audio 
                        :src 		= "baseurl + '/' + fileurl" 
						class 		= "mx-auto w-3/4" 
						preload 	= "metadata" 
						controls 	= "true">
					</audio>
				</div>
				</div>
				<div class="imgmeta p-8" v-if="filemeta">
					<input 
						title 		= "fileid" 
						type 		= "hidden" 
						placeholder = "id" 
						v-model 	= "fileid" 
						@input 		= "createmarkdown" 
						max 		= "140" 
						/>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="path">{{ $filters.translate('Path') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="path" type="text" readonly="true" v-model="fileurl" />
					</div>
					<div class="flex mb-2">
						<label class="w-1/5 py-2" for="width">{{ $filters.translate('Width') }}: </label>
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" name="width" type="text" placeholder="500" v-model="width" @input="createmarkdown" />
					</div>
					<div class="flex mb-2">
					    <label class="w-1/5 py-2" for="videopreload">{{ $filters.translate('Preload') }}: </label>
					    <select class="w-4/5 p-2 bg-stone-200 text-stone-900" name="videopreload" v-model="preload" @change="createmarkdown">
					        <option value="none">none</option>
					        <option value="metadata">metadata</option>
					        <option value="auto">auto</option>
					    </select>
					</div>
				</div>
  			</div>`,
	data: function(){
		return {
			maxsize: 20, // megabyte
			showmedialib: false,
			load: false,
			filemeta: false,
			fileextension: '',
			allowedExtensions: ['mp3', 'ogg'],
			fileurl: '',
			width: '500px',			
			fileid: '',
			savefile: false,
			preload: 'none',
			baseurl: data.urlinfo.baseurl,
		}
	},
	mounted: function() {
	    eventBus.$on('beforeSave', this.beforeSave);

		const maxsize = parseFloat(data?.settings?.maxfileuploads);
		if(!isNaN(maxsize) && maxsize > 0)
		{
			this.maxsize = maxsize;
		}

	    this.$refs.markdown.focus();

	    if (this.markdown) 
	    {
	        this.filemeta = true;

	        var fileurl = this.markdown.match(/path="(.*?)"/);
	        if (fileurl && fileurl[1]) 
	        {
	            this.fileurl = fileurl[1];
	        }

	        var width = this.markdown.match(/width="(.*?)"/);
	        if (width && width[1]) 
	        {
	            this.width = width[1];
	        } 

	        var preload = this.markdown.match(/preload="(.*?)"/);
	        if (preload && preload[1]) 
	        {
	            this.preload = preload[1];
	        } 
	    }
	},
	methods: {
		addFromMedialibFunction(file)
		{
		    this.showmedialib  = false;
		    this.savefile      = false;
		    this.filemeta      = true;

			if (this.allowedExtensions.includes(file.info.extension.toLowerCase()))
		    {
		        this.filetitle    = file.name;
		        this.fileextension = file.info.extension.toLowerCase();
		        this.fileurl       = file.url;
		    }
		    else 
		    {
		        let message = "Unsupported file type. Please select a valid audio file (mp3, ogg).";
		        eventBus.$emit('publishermessage', message);
		        return;
		    }

		    this.createmarkdown();
		},
		openmedialib()
		{
			this.showmedialib = true;
		},
		isChecked(classname)
		{
			if(this.fileclass == classname)
			{
				return ' checked';
			}
		},
		updatemarkdown(event, url)
		{
			this.$emit('updateMarkdownEvent', event.target.value);
		},
		createmarkdown()
		{
		    var errors = false;
		    var filemarkdown = false;

		    if (this.fileurl !== '')
		    {
		        if (this.fileurl.length < 101)
		        {
		            var width 	= this.width ? ' width="' + this.width + '"' : '';
		            var preload = this.preload ? ' preload="' + this.preload + '"' : ' preload="none"';

		            filemarkdown = '[:audio path="' + this.fileurl + '"' + width + preload + ' :]';
		        } 
		        else 
		        {
		            errors = this.$filters.translate('Maximum size of file link is 100 characters');
		        }
		    }

		    if (errors) 
		    {
		        eventBus.$emit('publishermessage', this.$filters.translate(errors));
		    } 
		    else if (filemarkdown) 
		    {
		        this.$emit('updateMarkdownEvent', filemarkdown);
		        this.compmarkdown = filemarkdown;
		    }
		},
		onFileChange( e )
		{
			if(e.target.files.length > 0)
			{
				let uploadedFile = e.target.files[0];

		        let allowedAudioTypes = ['audio/mpeg', 'audio/ogg'];
		        if (!allowedAudioTypes.includes(uploadedFile.type)) {
		            let message = "Unsupported file type. Please select an audio file (mp3, ogg).";
		            eventBus.$emit('publishermessage', message);
		            return;
		        }

				let size = uploadedFile.size / 1024 / 1024;
				
				if (size > this.maxsize)
				{
					let message = "The maximal size of a file is " + this.maxsize + " MB";
					eventBus.$emit('publishermessage', message);
					return;
				}
				else
				{
					self = this;
					
					self.load = true;

					let reader = new FileReader();
					reader.readAsDataURL(uploadedFile);
					reader.onload = function(e) {
						
						tmaxios.post('/api/v1/file',{
							'url':				data.urlinfo.route,
							'file':				e.target.result,
							'name': 			uploadedFile.name, 
						})
						.then(function (response) {

							self.load = false;

							self.filemeta 			= true;
							self.savefile 			= true;
							self.filetitle 			= response.data.fileinfo.title;
							self.fileextension 		= response.data.fileinfo.extension;
							self.fileurl 			= response.data.filepath;
							self.selectedrole 		= '';
							
							self.createmarkdown();
				    	})
						.catch(function (error)
						{
							self.load = false;
							if(error.response)
							{
								let message = self.$filters.translate(error.response.data.message);
								eventBus.$emit('publishermessage', message);
							}
						});
					}
				}
			}
		},
		beforeSave()
		{
			/* publish file before you save markdown */

			if(!this.fileurl)
			{
				let message = this.$filters.translate('file is missing.');
				eventBus.$emit('publishermessage', message);

				return;
			}

		    const fileExtension = this.fileurl.split('.').pop().toLowerCase();

		    if (!this.allowedExtensions.includes(fileExtension))
		    {
		        let message = this.$filters.translate('Unsupported file format. Only MP3, and OGG files are allowed.');
		        eventBus.$emit('publishermessage', message);
		        
		        return;
		    }

			if(!this.savefile)
			{
				this.createmarkdown();
				this.$emit('saveBlockEvent');
			}
			else
			{
				var self = this;

		        tmaxios.put('/api/v1/file',{
					'url':			data.urlinfo.route,
					'file': 		this.fileurl,
				})
				.then(function (response)
				{
					self.fileurl = response.data.path;

					self.createmarkdown();

					self.$emit('saveBlockEvent');
				})
				.catch(function (error)
				{
					if(error.response)
					{
						let message = self.$filters.translate(error.response.data.message);
						eventBus.$emit('publishermessage', message);
					}
				});
			}
		},		
	}
})

bloxeditor.component('shortcode-component', {
	props: ['markdown', 'disabled', 'index'],
	data: function(){
		return {
			shortcodedata: false,
			shortcodename: '',
			compmarkdown: '',
		}
	},
	template: `<div>
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-square-brackets">
							<use xlink:href="#icon-square-brackets"></use>
						</svg>
					</div>
					<div v-if="shortcodedata" class="p-8 bg-stone-100 dark:bg-stone-900" ref="markdown">
						<div class="flex mt-2 mb-2">
							<label class="w-1/5 py-2" for="shortcodename">{{ $filters.translate('Shortcode') }}: </label> 
							<select 
								class 		= "w-4/5 p-2 bg-stone-200 text-stone-900" 
								title 		= "shortcodename" 
								v-model 	= "shortcodename" 
								@change 	= "createmarkdown(shortcodename)"
								>
									<option 
										v-for 	= "shortcodeparams,name in shortcodedata" 
										:value 	= "name"
										> {{ name }}
									</option>
							</select>
						</div>
						<div class="flex mt-2 mb-2" v-for="attribute,key in shortcodedata[shortcodename]">
							<label class="w-1/5 py-2" for="key">{{key}}</label> 
							<div class="w-4/5 relative" v-if="shortcodedata[shortcodename][key].content">
								<input 
									class 		= "w-full p-2 bg-stone-200 text-stone-900" 
									type 		= "search" 
									list 		= "shortcodedata[shortcodename][key]" 
									v-model 	= "shortcodedata[shortcodename][key].value" 
									@input 		= "createmarkdown(shortcodename,key)"
								>
								<div class="absolute px-2 py-2 ml-2 text-stone-700 right-0 top-0">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20l-4-4m4 4l-4-4M10 14a4 4 0 100-8 4 4 0 000 8z"/>
									</svg>
								</div>
								<datalist id="shortcodedata[shortcodename][key]">
									<option 
										v-for 			= "item in shortcodedata[shortcodename][key].content" 
										:value 			= "item"
										>
									</option>
								</datalist>
							</div>
							<input v-else
								class 		= "w-4/5 p-2 bg-stone-200 text-stone-900" 
								type 		= "text"
								v-model 	= "shortcodedata[shortcodename][key]" 
								@input 		= "createmarkdown(shortcodename,key)"
							>
						</div>
					</div>
					<textarea v-else class="opacity-1 w-full bg-transparent px-6 py-3 outline-none" ref="markdown" placeholder="No shortcodes are registered" disabled></textarea>
				</div>`,
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		var myself = this;
		
		tmaxios.get('/api/v1/shortcodedata',
		{
		  	params: 
		  	{
				'url':			data.urlinfo.route,
			}
		})
		.then(function (response)
		{
			if (response.data.shortcodedata !== false)
			{
			    let cleanedShortcodes = {};
			    
			    for (let key in response.data.shortcodedata)
			    {
			        let shortcode = response.data.shortcodedata[key];
			        
			        /* Skip if the shortcode data is an empty array */
			        if (Array.isArray(shortcode) && shortcode.length === 0)
			        {
			            continue;
			        }
			        
			        /* Remove the "showInVisualEditor" key */
			        if (typeof shortcode === 'object' && shortcode !== null)
			        {
			            delete shortcode.showInVisualEditor;
			        }
			        
			        // Add the cleaned shortcode back if not empty
			        cleanedShortcodes[key] = shortcode;
			    }
			    
			    // Assign the cleaned shortcodedata
 				myself.shortcodedata = Object.keys(cleanedShortcodes).length > 0 ? cleanedShortcodes : false;
 			    myself.parseshortcode();
			}
		})
		.catch(function (error)
		{
			if(error.response)
		    {
				let message = self.$filters.translate(error.response.data.message);
				eventBus.$emit('publishermessage', message);
		   	}
		});
	},
	methods: {
		beforeSave()
		{
			this.$emit('saveBlockEvent');
		},
		parseshortcode()
		{
			if(this.markdown)
			{
				var shortcodestring 	= this.markdown.trim();
				shortcodestring 		= shortcodestring.slice(2,-2);
				this.shortcodename 		= shortcodestring.substr(0,shortcodestring.indexOf(' '));

				var regexp 				= /(\w+)\s*=\s*("[^"]*"|\'[^\']*\'|[^"\'\\s>]*)/g;
				var matches 			= shortcodestring.matchAll(regexp);
				matches 				= Array.from(matches);
				matchlength 			= matches.length;
				
				if(matchlength > 0)
				{
					for(var i=0;i<matchlength;i++)
					{
						var attribute 		= matches[i][1];
						var attributeValue 	= matches[i][2].replaceAll('"','');

						this.shortcodedata[this.shortcodename][attribute] = attributeValue;
					}
				}
			}
		},
		createmarkdown(shortcodename)
		{
			var attributes = '';
			for (var key in this.shortcodedata[shortcodename])
			{
				if(this.shortcodedata[shortcodename].hasOwnProperty(key))
				{
					let value = false;

			        if (typeof this.shortcodedata[shortcodename][key] == 'string')
			        {
			            value = this.shortcodedata[shortcodename][key];
			        } 
			        else if (Array.isArray(this.shortcodedata[shortcodename][key].content))
			        {
			            let item = this.shortcodedata[shortcodename][key];
			            if (item.content.includes(item.value)) 
			            { 
			            	// Check if value exists in content array
			                value = item.value;
			            }
			        }

			        if (value) 
			        {
			            attributes += ' ' + key + '="' +  value + '"';
			        }
			    }
			}

			this.compmarkdown = '[:' + shortcodename + attributes + ' :]';

			this.$emit('updateMarkdownEvent', this.compmarkdown);
		},
		updatemarkdown(event)
		{
			this.$emit('updateMarkdownEvent', event.target.value);
		},
	},
})

/* deprecated, use embed plugin instead */
bloxeditor.component('youtube-component', {
	props: ['markdown', 'disabled', 'index'],
	template: `<div class="video dropbox p-8">
					<div class="absolute top-3 -left-5 text-stone-400">
						<svg class="icon icon-play">
							<use xlink:href="#icon-play"></use>
						</svg>
					</div>
					<div class="flex mt-2 mb-2">
						<label class="w-1/5 py-2" for="video">{{ $filters.translate('Link to youtube') }}: </label> 
						<input class="w-4/5 p-2 bg-stone-200 text-stone-900" type="url" ref="markdown" placeholder="https://www.youtube.com/watch?v=" :value="markdown" :disabled="disabled" @input="updatemarkdown($event.target.value)">
					</div>
			</div>`,
	data: function(){
		return {
			edited: false,
			url: false,
			videoid: false,
			param: false,
			path: false,
			provider: false,
			providerurl: false,
			compmarkdown: '',
		}
	},
	mounted: function(){

		eventBus.$on('beforeSave', this.beforeSave );

		this.$refs.markdown.focus();

		if(this.markdown)
		{
			this.parseImageMarkdown(this.markdown);
		}
	},
	methods: {
		generateMarkdown()
		{
			this.compmarkdown = '![' + this.provider + '-video](' + this.path + ' "click to load video"){#' + this.videoid + ' .' + this.provider + '}';
		},
		parseImageMarkdown(imageMarkdown)
		{
			let regexpurl = /\((.*)(".*")\)/;
			let match = imageMarkdown.match(regexpurl);
			let imageUrl = match[1];

			let regexprov = /live\/(.*?)-/;
			let matchprov = imageUrl.match(regexprov);
			this.provider = matchprov[1];

			if(this.provider == 'youtube')
			{
				this.providerurl = "https://www.youtube.com/watch";
				this.param = "v=";
			}

			let videoid = imageMarkdown.match(/#.*? /);
			if(videoid)
			{
				this.videoid = videoid[0].trim().substring(1);
			}
			
			this.updatemarkdown(this.providerurl + "?" + this.param + this.videoid);
		},
		parseUrl(url)
		{
			let urlparts = url.split('?');
			let urlParams = new URLSearchParams(urlparts[1]);

			this.providerurl = urlparts[0];

			if(urlParams.has("v"))
			{
				this.param 		= "v=";
				this.videoid 	= urlParams.get("v");
				this.provider 	= "youtube";
			}
			if(this.provider != "youtube")
			{
				this.updatemarkdown("");
				let message = this.$filters.translate("We only support youtube right now.");
				eventBus.$emit('publishermessage', message);
			}
		},
		updatemarkdown(url)
		{
			this.edited = true;
			this.url = url;
			this.parseUrl(url);
			this.generateMarkdown();
			this.$emit('updateMarkdownEvent', url);
		},
		beforeSave()
		{
			if(!this.edited)
			{
				eventBus.$emit('closeComponents');
				return;
			}
			var self = this;

			tmaxios.post('/api/v1/video',{
				'url':				data.urlinfo.route,
				'videourl': 		this.url,
				'provider':  		this.provider,
				'providerurl': 		this.providerurl,
				'videoid': 			this.videoid,
			})
			.then(function (response)
			{
				self.path = response.data.path;
				self.$emit('saveBlockEvent');
			})
			.catch(function (error)
			{
				if(error.response)
				{
					let message = self.$filters.translate(error.response.data.message);
					eventBus.$emit('publishermessage', message);
				}
			});
		},
	},
})
