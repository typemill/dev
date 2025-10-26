app.component('component-paragraph', {
	props: ['id', 'description', 'maxlength', 'hidden', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'value', 'css', 'errors'],	
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<p :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</p>
			  	<p v-html="$filters.translate(description)"></p>
			  </div>`,
})


app.component('component-text', {
	props: ['id', 'description', 'maxlength', 'hidden', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'value', 'css', 'errors'],	
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<input type="text" class="text-stone-900 h-12 w-full border px-2 py-3" 
					:id="id"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
					:maxlength="maxlength"
					:readonly="readonly"
					:hidden="hidden"
					:required="required"
					:disabled="disabled"
					:name="name"
					:placeholder="placeholder"
					:value="value"
					@input="update($event, name)"><slot></slot>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-textarea', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<textarea rows="8" class="w-full border border-stone-300 text-stone-900 bg-stone-200 px-2 py-3"
					:id="id"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
					:readonly="readonly"
					:required="required"  
					:disabled="disabled"  
					:name="name"
					:placeholder="placeholder"
					:value="value"
					@input="update($event, name)"></textarea><slot></slot>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
		formatValue: function(value)
		{
			/*
			if(value !== null && typeof value === 'object')
			{
				this.textareaclass = 'codearea';
				return JSON.stringify(value, undefined, 4);
			}
			return value;
			*/
		},
	},
})

app.component('component-codearea', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	data: function() {
		return {
			highlighted: '',
		}
	},
	template: `<div :class="css ? css : ''" class="w-full plain mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="codearea">
					<textarea data-el="editor" class="editor" ref="editor" 
						:id="id"
						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
						:readonly="readonly"
						:required="required"  
						:disabled="disabled"  
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event, name)"></textarea><slot></slot>
					<pre aria-hidden="true" class="highlight hljs"><code data-el="highlight" v-html="highlighted"></code></pre>
				</div>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	mounted: function()
	{
		this.initialize()

		eventBus.$on('codeareaupdate', this.initialize );		
	},
	methods: {
		initialize()
		{
			this.$nextTick(() => {
				this.highlight(this.value);
				this.resizeCodearea();
			});
		},
		update($event, name)
		{
			this.highlight($event.target.value);
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});

			this.$nextTick(() => {
				this.resizeCodearea();
			});
		},
		resizeCodearea() {
			let codeeditor = this.$refs.editor;
			const scrollPosition = codeeditor.scrollTop; // Store the current scroll position

			window.requestAnimationFrame(() => {
				if (codeeditor.scrollHeight !== codeeditor.clientHeight)
				{
					codeeditor.style.height = `${codeeditor.scrollHeight + 2}px`;
				}
				codeeditor.scrollTop = scrollPosition; // Restore the scroll position
			});
		},
    	highlight(code)
		{
			if(code === undefined)
			{
				return;
			}

			window.requestAnimationFrame(() => {
				highlighted = hljs.highlightAuto(code, ['xml','css','yaml','markdown']).value;
				this.highlighted = highlighted;
			});
		},
	},
})

app.component('component-select', {
	props: ['id', 'description', 'readonly', 'required', 'disabled', 'label', 'name', 'type', 'css', 'options', 'value', 'errors', 'dataset', 'userroles'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
			    <select class="form-select block w-full border border-stone-300 text-stone-900 bg-stone-200 px-2 py-3 h-12 transition ease-in-out"
					:id="id"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
					:name="name"
					:required="required"  
					:disabled="disabled"
					v-model="value" 
			    	@change="update($event,name)">
			      	<option disabled value="">Please select</option>
			      	<option v-for="option,optionkey in options" v-bind:value="optionkey">{{option}}</option>
			    </select><slot></slot>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-checkbox', {
	props: ['id', 'description', 'readonly', 'required', 'disabled', 'label', 'checkboxlabel', 'name', 'type', 'css', 'value', 'errors'],
	data() {
		return {
	    	checked: false
		}
	},
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<div class="block mb-1 font-medium">{{ $filters.translate(label) }}</div>
				<label :for="name" class="inline-flex items-start">
				  <input type="checkbox" class="w-6 h-6"  
					:id="id"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"					
					:readonly="readonly"
					:required="required"  
					:disabled="disabled"
				    :name="name"
				    v-model="checked"
				    @change="update(checked, name)">
				    <span class="ml-2 text-sm">{{ $filters.translate(checkboxlabel) }}</span>
			  	</label><slot></slot>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	mounted: function()
	{
		if(this.value === true || this.value == 'on')
		{
			this.checked = true;
		}
	},
	methods: {
		update: function(checked, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': checked});
		},
	},
})

app.component('component-checkboxlist', {
	props: ['description', 'readonly', 'required', 'disabled', 'label', 'checkboxlabel', 'options', 'name', 'type', 'css', 'value', 'errors'],
	data() {
		return {
	    	checkedoptions: []
		}
	},
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<div class="block mb-1 font-medium">{{ $filters.translate(label) }}</div>
				<label class="flex items-start mb-2 mt-2" v-for="option, optionvalue in options" >
				  <input type="checkbox" class="w-6 h-6"
					:id="optionvalue"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
				  	:value="optionvalue" 
				  	v-model="checkedoptions" 
				  	@change="update(checkedoptions, name)">
				  	<span class="ml-2 text-sm">{{ $filters.translate(option) }}</span>
			  	</label><slot></slot>
				<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	mounted: function()
	{
		if(this.value && typeof this.value === 'object')
		{
			this.checkedoptions = this.value;
		}
	},
	methods: {
		update: function(checkedoptions, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': checkedoptions});
		},
	},
})

app.component('component-radio', {
	props: ['id', 'description', 'readonly', 'required', 'disabled', 'options', 'label', 'name', 'type', 'css', 'value', 'errors'],
	data() {
		return {
	    	picked: this.value
		}
	},
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<div class="block mb-1 font-medium">{{ $filters.translate(label) }}</div>
				<label class="flex items-start mb-2 mt-2" v-for="option,optionvalue in options">
				  <input type="radio" class="w-6 h-6"
					:id="id"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
					:readonly="readonly"
					:required="required"  
					:disabled="disabled"
				  	:name="name"
				  	:value="optionvalue" 
				  	v-model="picked" 
				  	@change="update(picked, name)">
				  	<span class="ml-2 text-sm">{{ $filters.translate(option) }}</span>
			  	</label><slot></slot>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function(picked, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': picked});
		},
	},
})

app.component('component-number', {
	props: ['id', 'description', 'min', 'max', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<input type="number" class="h-12 w-full border border-stone-300 text-stone-900 bg-stone-200 px-2 py-3"
					:id="id"
					:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
					:min="min"
					:max="max"
					:maxlength="maxlength"
					:readonly="readonly"
					:required="required"
					:disabled="disabled"
					:name="name"
					:placeholder="placeholder"
					:value="value"
					@input="update($event, name)"><slot></slot>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-date', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="relative">
					<div class="absolute h-12 inset-y-0 left-0 flex items-center pl-3 pointer-events-none">				
				    	<svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				    		<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
				    	</svg>
					</div>
					<input type="date" class="h-12 w-full border pl-10 pr-2 py-3 text-stone-900" 
						:id="id"
						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
						:readonly="readonly"
						:required="required"  
						:disabled="disabled"  
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event, name)"><slot></slot>
				</div>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-email', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="relative">
					<div class="absolute h-12 inset-y-0 left-0 flex items-center pl-3 pointer-events-none">				
					    <svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					    	<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
					    	<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
					    </svg>
					</div>
					<input type="email" class="h-12 w-full border pl-10 pr-2 py-3 text-stone-900"
						:id="id"
						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
						:maxlength="maxlength"
						:readonly="readonly"
						:required="required"
						:disabled="disabled"
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event, name)"><slot></slot>
				</div>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-tel', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="relative">
					<div class="absolute h-12 inset-y-0 left-0 flex items-center pl-3 pointer-events-none">				
					    <svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
							<path d="M22 20c-2 2-2 4-4 4s-4-2-6-4-4-4-4-6 2-2 4-4-4-8-6-8-6 6-6 6c0 4 4.109 12.109 8 16s12 8 16 8c0 0 6-4 6-6s-6-8-8-6z"></path>
					    </svg>
					</div>
					<input type="tel" class="h-12 w-full border pl-10 pr-2 py-3 text-stone-900"
						:id="id"
						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
						:maxlength="maxlength"
						:readonly="readonly"
						:required="required"
						:disabled="disabled"
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event, name)"><slot></slot>
				</div>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-url', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="relative">
					<div class="absolute h-12 inset-y-0 left-0 flex items-center pl-3 pointer-events-none">				
					    <svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
							<path d="M13.757 19.868c-0.416 0-0.832-0.159-1.149-0.476-2.973-2.973-2.973-7.81 0-10.783l6-6c1.44-1.44 3.355-2.233 5.392-2.233s3.951 0.793 5.392 2.233c2.973 2.973 2.973 7.81 0 10.783l-2.743 2.743c-0.635 0.635-1.663 0.635-2.298 0s-0.635-1.663 0-2.298l2.743-2.743c1.706-1.706 1.706-4.481 0-6.187-0.826-0.826-1.925-1.281-3.094-1.281s-2.267 0.455-3.094 1.281l-6 6c-1.706 1.706-1.706 4.481 0 6.187 0.635 0.635 0.635 1.663 0 2.298-0.317 0.317-0.733 0.476-1.149 0.476z"></path>
							<path d="M8 31.625c-2.037 0-3.952-0.793-5.392-2.233-2.973-2.973-2.973-7.81 0-10.783l2.743-2.743c0.635-0.635 1.664-0.635 2.298 0s0.635 1.663 0 2.298l-2.743 2.743c-1.706 1.706-1.706 4.481 0 6.187 0.826 0.826 1.925 1.281 3.094 1.281s2.267-0.455 3.094-1.281l6-6c1.706-1.706 1.706-4.481 0-6.187-0.635-0.635-0.635-1.663 0-2.298s1.663-0.635 2.298 0c2.973 2.973 2.973 7.81 0 10.783l-6 6c-1.44 1.44-3.355 2.233-5.392 2.233z"></path>
					    </svg>
					</div>
					<input type="url" class="h-12 w-full border pl-10 pr-2 py-3 text-stone-900"
						:id="id"
						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
						:maxlength="maxlength"
						:readonly="readonly"
						:required="required"
						:disabled="disabled"
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event, name)"><slot></slot>
				</div>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-color', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">				
					    <svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
							<path d="M30.828 1.172c-1.562-1.562-4.095-1.562-5.657 0l-5.379 5.379-3.793-3.793-4.243 4.243 3.326 3.326-14.754 14.754c-0.252 0.252-0.358 0.592-0.322 0.921h-0.008v5c0 0.552 0.448 1 1 1h5c0 0 0.083 0 0.125 0 0.288 0 0.576-0.11 0.795-0.329l14.754-14.754 3.326 3.326 4.243-4.243-3.793-3.793 5.379-5.379c1.562-1.562 1.562-4.095 0-5.657zM5.409 30h-3.409v-3.409l14.674-14.674 3.409 3.409-14.674 14.674z"></path>
					    </svg>
					</div>
					<input type="color" class="h-12 w-full border pl-10 pr-1 py-1"
						:id="id"
 						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
 						:maxlength="maxlength"
						:readonly="readonly"
						:required="required"
						:disabled="disabled"
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event, name)"><slot></slot>
				</div>
			  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-password', {
	props: ['id', 'description', 'maxlength', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'autocomplete', 'generator', 'css', 'value', 'errors'],
	data() {
		return {
	    	fieldType: "password"
		};
	},	
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="relative">
					<div class="absolute h-12 inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					    <svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
							<path d="M18.5 14h-0.5v-6c0-3.308-2.692-6-6-6h-4c-3.308 0-6 2.692-6 6v6h-0.5c-0.825 0-1.5 0.675-1.5 1.5v15c0 0.825 0.675 1.5 1.5 1.5h17c0.825 0 1.5-0.675 1.5-1.5v-15c0-0.825-0.675-1.5-1.5-1.5zM6 8c0-1.103 0.897-2 2-2h4c1.103 0 2 0.897 2 2v6h-8v-6z"></path>
					    </svg>
					</div>
					<input :type="fieldType" class="h-12 w-full border pl-10 pr-10 py-1 text-stone-900"
						:id="id"
 						:class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'"
						:maxlength="maxlength"
						:readonly="readonly"
						:required="required"
						:disabled="disabled"
						:autocomplete="autocomplete"
						:name="name"
						:placeholder="placeholder"
						:value="value"
						@input="update($event.target.value, name)">
					<div class="absolute inset-y-0 right-0 flex items-center pr-3">
					    <button v-if="fieldType == 'password'" @click.prevent="toggleFieldType()" aria-label="toggle password visibility" aria-pressed="false">
					    	<svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
								<path d="M16 6c-6.979 0-13.028 4.064-16 10 2.972 5.936 9.021 10 16 10s13.027-4.064 16-10c-2.972-5.936-9.021-10-16-10zM23.889 11.303c1.88 1.199 3.473 2.805 4.67 4.697-1.197 1.891-2.79 3.498-4.67 4.697-2.362 1.507-5.090 2.303-7.889 2.303s-5.527-0.796-7.889-2.303c-1.88-1.199-3.473-2.805-4.67-4.697 1.197-1.891 2.79-3.498 4.67-4.697 0.122-0.078 0.246-0.154 0.371-0.228-0.311 0.854-0.482 1.776-0.482 2.737 0 4.418 3.582 8 8 8s8-3.582 8-8c0-0.962-0.17-1.883-0.482-2.737 0.124 0.074 0.248 0.15 0.371 0.228v0zM16 13c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"></path>
					    	</svg>
					    </button>
					    <button v-else @click.prevent="toggleFieldType()" aria-label="toggle password visibility" aria-pressed="true">
						    <svg aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
								<path d="M29.561 0.439c-0.586-0.586-1.535-0.586-2.121 0l-6.318 6.318c-1.623-0.492-3.342-0.757-5.122-0.757-6.979 0-13.028 4.064-16 10 1.285 2.566 3.145 4.782 5.407 6.472l-4.968 4.968c-0.586 0.586-0.586 1.535 0 2.121 0.293 0.293 0.677 0.439 1.061 0.439s0.768-0.146 1.061-0.439l27-27c0.586-0.586 0.586-1.536 0-2.121zM13 10c1.32 0 2.44 0.853 2.841 2.037l-3.804 3.804c-1.184-0.401-2.037-1.521-2.037-2.841 0-1.657 1.343-3 3-3zM3.441 16c1.197-1.891 2.79-3.498 4.67-4.697 0.122-0.078 0.246-0.154 0.371-0.228-0.311 0.854-0.482 1.776-0.482 2.737 0 1.715 0.54 3.304 1.459 4.607l-1.904 1.904c-1.639-1.151-3.038-2.621-4.114-4.323z"></path>
								<path d="M24 13.813c0-0.849-0.133-1.667-0.378-2.434l-10.056 10.056c0.768 0.245 1.586 0.378 2.435 0.378 4.418 0 8-3.582 8-8z"></path>
								<path d="M25.938 9.062l-2.168 2.168c0.040 0.025 0.079 0.049 0.118 0.074 1.88 1.199 3.473 2.805 4.67 4.697-1.197 1.891-2.79 3.498-4.67 4.697-2.362 1.507-5.090 2.303-7.889 2.303-1.208 0-2.403-0.149-3.561-0.439l-2.403 2.403c1.866 0.671 3.873 1.036 5.964 1.036 6.978 0 13.027-4.064 16-10-1.407-2.81-3.504-5.2-6.062-6.938z"></path>
							</svg>
					    </button>
					</div>
				</div>
				<div class="flex justify-between text-xs">
					<div class="w-2/3">
				  		<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
					  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
					</div>
					<div v-if="generator" class="w-1/3 text-right">
						<button @click.prevent="generatePassword()" class="text-teal-600">generate a password</button>
					</div>
				</div>
			  </div>`,
	methods: {
		update: function(newvalue, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': newvalue});
		},
		toggleFieldType: function()
		{
			if (this.fieldType === "password")
			{
		    	this.fieldType = "text";
		  	} 
		  	else
		  	{
		    	this.fieldType = "password";
		  	}
		},
		generatePassword: function()
		{
			const digits 		= '0123456789';
			const upper 		= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			const lower 		= upper.toLowerCase();
			const characters 	= digits + upper + lower;
			const length 		= 40;

		    const randomCharacters = Array.from({ length }, (_) =>
		        this.getRandomCharacter(characters),
		    ).join('')

		    const passwordLength = this.getRandomInt(30,40);

		    const password = randomCharacters.substring(0,passwordLength);

			this.update(password, this.name);
		},
		getRandomInt: function(min,max)
		{
  			return Math.floor(Math.random() * (max - min + 1) + min);
  		},
		getRandomCharacter: function(characters)
		{	
			let randomNumber

		    do{
		        randomNumber = crypto.getRandomValues(new Uint8Array(1))[0]
		    } while (randomNumber >= 256 - (256 % characters.length))

		    return characters[randomNumber % characters.length]
		}
	},
})

app.component('component-hidden', {
	props: ['id', 'maxlength', 'required', 'disabled', 'name', 'type', 'css', 'value', 'errors'],
	template: `<div class="hidden">
				<input type="hidden"
					:id="id"
					:maxlength="maxlength"
					:name="name"
					:value="value"
					@input="update($event, name)">
			  </div>`,
	methods: {
		update: function($event, name)
		{
			eventBus.$emit('forminput', {'name': name, 'value': $event.target.value});
		},
	},
})

app.component('component-customfields', {
	props: ['id', 'description', 'readonly', 'required', 'disabled', 'options', 'label', 'name', 'type', 'css', 'keypattern', 'valuepattern', 'value', 'errors'],
	data: function () {
		return {
			fielderrors: false,
			fielddetails: {},
			disableaddbutton: false,
			cfvalue: [{}]
		 }
	},
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
			  	<p v-if="fielderrors" class="text-xs text-red-500 mb-2">{{ fielderrors }}</p>
			  	<p v-else class="text-xs mb-2">{{ $filters.translate(description) }}</p>
	  			<transition-group name="fade" tag="div">
	  				<div 
	  					v-show 	= "isLarge(css)" 
	  					class 	= "relative mb-2 border-b border-stone-200 dark:border-stone-600" 
	  					v-for 	= "(pairobject, pairindex) in cfvalue" 
	  					:key 	= "pairindex"
	  					>
						<div class=" mb-3 w-100 flex justify-between">
							<input 
								type 		= "text" 
								placeholder = "key" 
								class 		= "h-12 w-half border px-2 py-3 border-stone-300 bg-stone-200 text-stone-900" 
								:class 		= "pairobject.keyerror" 
								:value 		= "pairobject.key" 
								@input 		= "updatePairKey(pairindex,$event)">
							<button class="text-white bg-stone-700 w-6 h-6 text-xs hover:bg-rose-500 ml-1" @click.prevent="deleteField(pairindex)">
								<svg class="icon icon-minus">
									<use xlink:href="#icon-minus"></use>
								</svg>
							</button>				  		
				  		</div>
				  		<div class="w-full mb-2">
			  			  	<textarea 
			  			  		placeholder = "value" 
								class 		= "w-full border px-2 py-3 border-stone-300 bg-stone-200 text-stone-900" 
			  			  		:class 		= "pairobject.valueerror" 
								rows 		= "5"
			  			  		:value 		= "pairobject.value" 
			  			  		@input 		= "updatePairValue(pairindex,$event)">
			  			  	</textarea>
				  		</div>
					</div>
	  				<div
						v-show 	= "!isLarge(css)"
	  					v-for 	= "(pairobject, pairindex) in cfvalue" 
	  					class 	= "relative flex mb-3" 
	  					:key 	= "pairindex"
	  					>
						<div>
							<input 
								type 		= "text" 
								placeholder = "key" 
								class 		= "h-12 w-full border px-2 py-3 border-stone-300 bg-stone-200 text-stone-900" 
								:class 		= "pairobject.keyerror" 
								:value 		= "pairobject.key" 
								@input 		= "updatePairKey(pairindex,$event)">
				  		</div>
				  		<div class="flex-grow">
				  			<div class="flex">
					  			<svg class="icon icon-dots-two-vertical mt-3">
					  				<use xlink:href="#icon-dots-two-vertical"></use>
					  			</svg>
				  			  	<textarea 
				  			  		placeholder = "value" 
									class 		= "w-full border px-2 py-3 border-stone-300 bg-stone-200 text-stone-900" 
				  			  		:class 		= "pairobject.valueerror" 
				  			  		:value 		= "pairobject.value" 
				  			  		@input 		= "updatePairValue(pairindex,$event)"></textarea>
								<button class="text-white bg-stone-700 w-6 h-6 text-xs hover:bg-rose-500 ml-1" @click.prevent="deleteField(pairindex)">
									<svg class="icon icon-minus">
										<use xlink:href="#icon-minus"></use>
									</svg>
								</button>
							</div>
				  		</div> 
					</div>
				</transition-group>
  				<button :disabled="disableaddbutton" class="text-white bg-stone-700 w-6 h-6 text-xs hover:bg-teal-500 mr-2" @click.prevent="addField()">
	  				<svg class="icon icon-plus">
	  					<use xlink:href="#icon-plus"></use>
	  				</svg>
	  			</button>
	  			<span class="text-sm">{{ $filters.translate('add entry') }}</span>	
			  </div>`,
	mounted: function(){
		if(typeof this.value === 'undefined' || this.value === null || this.value.length == 0)
		{
			// this.cfvalue = [{}];
			// this.update(this.cfvalue, this.name);
			this.disableaddbutton = 'disabled';
		}
		else
		{
			/* turn object { key:value, key:value } into array [[key,value][key,value]] */
			this.cfvalue = Object.entries(this.value);
			/* and back into array of objects [ {key: key, value: value}{key:key, value: value }] */
			this.cfvalue = this.cfvalue.map(function(item){ return { 'key': item[0], 'value': item[1] } });
		}
	},
	methods: {
		isLarge: function(css)
		{
			if(css && css.indexOf('cf-large') >= 0)
			{
				return true;
			}
			return false;
		},
		update: function(value, name)
		{
			this.fielderrors = false;
			this.mainerror = false;

			/* transform array of objects [{key:mykey, value:myvalue}] into array [[mykey,myvalue]] */
			var storedvalue = value.map(function(item){ return [item.key, item.value]; });

			/* transform array [[mykey,myvalue]] into object { mykey:myvalue } */
			storedvalue = Object.fromEntries(storedvalue);
						
			eventBus.$emit('forminput', {'name': name, 'value': storedvalue});
		},
		updatePairKey: function(index,event)
		{
			this.cfvalue[index].key = event.target.value.trim();

			var regex = /^[a-z0-9]+$/i;
			let keymessage = 'Error: Only alphanumeric for keys allowed';
			if (this.keypattern)
			{
				try {
			      regex = new RegExp('^' + this.keypattern + '$', 'i');
			      keymessage = 'Error: the input for the KEY must follow the pattern ' + this.keypattern;
			    } catch (e) {
			      console.error('Invalid regex pattern from YAML:', this.keypattern, e);
			    }
			}

			if(!this.keyIsUnique(event.target.value,index))
			{
				this.cfvalue[index].keyerror = 'red';
				this.fielderrors = 'Error: The key already exists';
				this.disableaddbutton = 'disabled';
				return;
			}
			else if(!regex.test(event.target.value))
			{
				this.cfvalue[index].keyerror = 'red';
				this.fielderrors = keymessage;
				this.disableaddbutton = 'disabled';
				return;
			}

			delete this.cfvalue[index].keyerror;
			this.disableaddbutton = false;
			this.update(this.cfvalue,this.name);
		},
		keyIsUnique: function(keystring, index)
		{
			for(obj in this.cfvalue)
			{
				if( (obj != index) && (this.cfvalue[obj].key == keystring) )
				{
					return false;
				}
			}
			return true;
		},
		updatePairValue: function(index, event)
		{
			this.cfvalue[index].value = event.target.value;
			delete this.cfvalue[index].valueerror;

			if(event.target.value == '')
			{
				this.cfvalue[index].valueerror = 'red';
				this.fielderrors = 'The input for the VALUE cannot be empty.';
			}
			else if(this.valuepattern)
			{
				try {
			      	let regex = new RegExp('^' + this.valuepattern + '$', 'i');
			      	valuemessage = 'Error: the input for the VALUE must follow the pattern ' + this.valuepattern;
					if(!regex.test(event.target.value))
					{
						this.cfvalue[index].valueerror = 'red';
						this.fielderrors = 'Error: the input for the VALUE must follow the pattern ' + this.valuepattern;					}
			    } catch (e) {
			      console.error('Invalid regex pattern from YAML:', this.valuepattern, e);
			    }
			}
			else
			{
				let regex = /<.*(?=>)/gm;
				if(regex.test(event.target.value))
				{
					this.cfvalue[index].valueerror = 'red';
					this.fielderrors = 'Error: the input contains invalid characters like html code';
				}
			}
			
			if(!this.cfvalue[index].valueerror)
			{
				this.update(this.cfvalue,this.name);
			} 
		},
		addField: function()
		{
			for(object in this.cfvalue)
			{
				if(Object.keys(this.cfvalue[object]).length === 0)
				{
					return;
				}
			}
			this.cfvalue.push({});
			this.disableaddbutton = 'disabled';
		},
		deleteField: function(index)
		{
			this.cfvalue.splice(index,1);
			this.disableaddbutton = false;
			this.update(this.cfvalue,this.name);
		},
	},
})

app.component('component-image', {
	props: ['id', 'description', 'maxlength', 'hidden', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'value', 'css', 'errors', 'keepformat'],
	components: {
		medialib: medialib
	},	
	data: function(){
		return {
			maxsize: 10, // megabyte
			imagepreview: '',
			showmedialib: false,
			quality: false,
			qualitylabel: false,
		}
	},
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">
				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>
				<div class="flex flex-wrap items-start">
					<div class="lg:w-half w-full">
						<div class="w-full lg:w-80 h-80 mb-3 lg:table-cell align-middle bg-chess">
							<img :src="imagepreview" class="max-w-xs max-h-80 table mx-auto">
						</div>
					</div>
					<div class="lg:w-half w-full ph3 lh-copy f6 relative">
						<div class="relative w-full bg-stone-600 hover:bg-stone-900">
							<p class="relative w-full text-white text-center px-2 py-3"><svg class="icon icon-upload mr-1"><use xlink:href="#icon-upload"></use></svg> {{ $filters.translate('upload an image') }}</p>
							<input class="absolute w-full top-0 opacity-0 bg-stone-900 cursor-pointer px-2 py-3" type="file" name="image" accept="image/*" @change="onFileChange( $event )" />
						</div>
						<div class="w-full mt-3">
							<button class="w-full bg-stone-600 hover:bg-stone-900 text-white px-2 py-3 text-center cursor-pointer transition duration-100" @click.prevent="showmedialib = true"><svg class="icon icon-image mr-1"><use xlink:href="#icon-image"></use></svg> {{ $filters.translate('select from medialib') }}</button>
						</div>
						<div class="w-full mt-3">
							<label class="block mb-1">{{ $filters.translate('Image URL (read only)') }}</label>
							<div class="flex">
								<button @click.prevent="deleteImage()" class="w-1/6 bg-stone-200 dark:bg-stone-600 hover:bg-rose-500 hover:dark:bg-rose-500 hover:text-white">x</button>
								<input type="text" class="h-12 w-5/6 border px-1 py-1 text-stone-900" :class="errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'" 
									:id="id"
									:maxlength="maxlength"
									readonly="readonly"
									:hidden="hidden"
									:required="required"
									:disabled="disabled"
									:name="name"
									:placeholder="placeholder"
									:value="value"
									@input="update($event, name)">
							</div>
							<div v-if="qualitylabel" class="w-full mt-3">
								<button class="w-full cursor-pointer bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 hover:dark:bg-stone-900 text-center px-1 py-1 transition duration-100" @click.prevent="switchQuality(value)">{{ qualitylabel }}</button>
							</div>
						</div>
					  	<p v-if="errors[name]" class="text-xs text-red-500">{{ errors[name] }}</p>
					  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>
					</div>
				</div>

				<Transition name="initial" appear>
					<div v-if="showmedialib" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 dark:bg-stone-700 z-50">
						<button class="w-full bg-stone-200 dark:bg-stone-900 hover:dark:bg-rose-500 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="images" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition>

			  </div>`,
	mounted: function() {

		const maxsize = parseFloat(data?.settings?.maximageuploads);
		if(!isNaN(maxsize) && maxsize > 0)
		{
			this.maxsize = maxsize;
		}

		if(this.hasValue(this.value))
		{
			this.imagepreview = tmaxios.defaults.baseURL + '/' + this.value;

			/* switcher for quality */
			if(this.value.indexOf("/live/") > -1 )
			{
				this.quality = 'optimized';
				this.qualitylabel = 'switch size to: maximum';
			}
			else if(this.value.indexOf("/original/") > -1)
			{
				this.quality = 'maximum';
				this.qualitylabel = 'switch size to: optimized';
			}
		}
	},
	methods: {
		addFromMedialibFunction(value)
		{		
		//	this.imgfile 		= value;
			this.imagepreview 	= data.urlinfo.baseurl + '/' + value;
			this.showmedialib 	= false;

			this.update(value);
		},
		hasValue: function(value)
		{
			if(typeof this.value !== "undefined" && this.value !== false && this.value !== null && this.value !== '')
			{
				return true;
			}
			return false;
		},
		switchQuality: function(value)
		{
			if(this.hasValue(value))
			{
				if(this.quality == 'optimized')
				{
					this.quality 		= 'maximum';
					this.qualitylabel 	= 'switch size to: optimized';
					var newUrl 			= value.replace("/live/", "/original/");
					this.update(newUrl);
				}
				else
				{
					this.quality 		= 'optimized';
					this.qualitylabel 	= 'switch quality to: maximum';
					var newUrl 			= value.replace("/original/", "/live/");
					this.update(newUrl);
				}
			}
		},
		update: function(filepath)
		{
			eventBus.$emit('forminput', {'name': this.name, 'value': filepath});
		},
		/*
		updatemarkdown: function(markdown, url)
		{
			/* is called from child component medialib 
			this.update(url);
		},
		createmarkdown: function(url)
		{
			/* is called from child component medialib 
			this.update(url);
		},
		*/
		deleteImage: function()
		{
			this.imagepreview = '';
			this.update('');
		},
		onFileChange: function( e )
		{
			if(e.target.files.length > 0)
			{
				let imageFile = e.target.files[0];
				let size = imageFile.size / 1024 / 1024;
				
				if (!imageFile.type.match('image.*'))
				{
					alert('only images allowed');
/*					publishController.errors.message = "Only images are allowed."; */
				} 
				else if (size > this.maxsize)
				{
					alert('too big');
/*					publishController.errors.message = "The maximal size of images is " + this.maxsize + " MB"; */
				}
				else
				{
					sharedself = this;
					
					let keepformat = this.keepformat ? true : false;
					let reader = new FileReader();
					reader.readAsDataURL(imageFile);
					reader.onload = function(e) 
					{
						sharedself.imagepreview = e.target.result;

					    tmaxios.post('/api/v1/image',{
							'image':			e.target.result,
							'name': 			imageFile.name,
							'publish':  		false,
							'keepformat': 		keepformat
						})
					    .then(function (response) {
							sharedself.update(response.data.path);
						})
					    .catch(function (error)
					    {
							sharedself.load = false;
					    	if(error.response)
					    	{
					    		console.info(error.response);
	/*				        	publishController.errors.message = error.response.data.errors; */
					      	}
					    });
					}
				}
			}
		}
	},
})

app.component('component-file', {
	props: ['id', 'description', 'maxlength', 'hidden', 'readonly', 'required', 'disabled', 'placeholder', 'label', 'name', 'type', 'value', 'css', 'errors'],
	components: {
		medialib: medialib
	},
	data: function(){
		return {
			maxsize: 20, // megabyte
			showmedialib: false,
//			fileid: '',
//			load: false,
			error: false,
			userroles: ['all'],
			selectedrole: '',
		}
	},
	template: `<div :class="css ? css : ''" class="w-full mt-5 mb-5">

				<label :for="name" class="block mb-1 font-medium">{{ $filters.translate(label) }}</label>

				<div class="border w-full p-3">

					<div class="flex flex-wrap justify-between block">

						<div class="lg:w-half w-full mt-5 mb-5">

							<label class="block mb-1 font-medium">{{ $filters.translate('File path (read only)') }}</label>
							<div class="flex">
								<button 
									@click.prevent 	= "deleteFile()" 
									class 			= "w-1/6 bg-stone-200 dark:bg-stone-600 hover:bg-rose-500 hover:dark:bg-rose-500 hover:text-white">x</button>
								<input 
									type 			= "text" 
									class 			= "h-12 w-5/6 border px-1 py-1 text-stone-900" 
									:class 			= "errors[name] ? ' border-red-500 bg-red-100' : ' border-stone-300 bg-stone-200'" 
									:id 			= "id"
									:maxlength 		= "maxlength"
									readonly 		= "readonly"
									:hidden 		= "hidden"
									:required 		= "required"
									:disabled 		= "disabled"
									:name 			= "name"
									:placeholder 	= "placeholder"
									:value 			= "value"
									@input 			= "update($event, name)">								
							</div>
						</div>

						<div class="lg:w-half w-full mt-5 mb-5">
							<label class="block mb-1 font-medium">{{ $filters.translate('Access') }}</label>
							<select 
									class 			= "form-select block w-full border border-stone-300 text-stone-900 bg-stone-200 px-2 py-3 h-12 transition ease-in-out border-stone-300 bg-stone-200" 
									name 			= "filerestriction" 
									v-model 		= "selectedrole" 
									@change 		= "updaterestriction"
								>
								<option disabled value="">{{ $filters.translate('Please select') }}</option>
								<option v-for="role in userroles">{{ role }}</option>
							</select>
						</div>

					</div>

					<div class="w-full ph3 lh-copy f6 relative flex justify-between">

						<div class="relative lg:w-half w-full bg-stone-600 hover:bg-stone-900">
							<p class="relative w-full text-white text-center px-2 py-3">
								<svg class="icon icon-upload mr-1">
									<use xlink:href="#icon-upload"></use>
								</svg> 
								{{ $filters.translate('upload a file') }}
							</p>
							<input 
								class 			= "absolute w-full top-0 opacity-0 bg-stone-900 cursor-pointer px-2 py-3" 
								type 			= "file"  
								name 			= "file" 
								accept 			= "*" 
								@change 		= "onFileChange( $event )" 
							/>
						</div>
						<div class="w-full lg:w-half">
							<button 
								class 			= "w-full bg-stone-600 hover:bg-stone-900 text-white px-2 py-3 text-center cursor-pointer transition duration-100" 
								@click.prevent 	= "showmedialib = true"
								>
								<svg class="icon icon-image mr-1">
									<use xlink:href="#icon-image"></use>
								</svg> 
								{{ $filters.translate('select from medialib') }}
							</button>
						</div>
					</div>
				</div>
				<p v-if="error" class="text-xs text-red-500">{{ error }}</p>
			  	<p v-else class="text-xs" v-html="$filters.translate(description)"></p>

				<Transition name="initial" appear>
					<div v-if="showmedialib" class="fixed top-0 left-0 right-0 bottom-0 bg-stone-100 z-50">
						<button class="w-full bg-stone-200 hover:bg-rose-500 hover:text-white p-2 transition duration-100" @click.prevent="showmedialib = false">{{ $filters.translate('close library') }}</button>
						<medialib parentcomponent="files" @addFromMedialibEvent="addFromMedialibFunction"></medialib>
					</div>
				</Transition> 
			  </div>`,

	mounted: function(){
		this.getrestriction();
		const maxsize = parseFloat(data?.settings?.maxfileuploads);		
		if(!isNaN(maxsize) && maxsize > 0)
		{
			this.maxsize = maxsize;
		}		
	},
	methods: {
		addFromMedialibFunction(file)
		{
			this.error 			= false;
			this.showmedialib 	= false;

			this.update(file.url);
			this.getrestriction(file.url);
		},
		update: function(filepath)
		{
			eventBus.$emit('forminput', {'name': this.name, 'value': filepath});
		},
		deleteFile: function()
		{
			this.error = false;

			this.update('');
			this.selectedrole = 'all';
		},
		getrestriction(newfilepath)
		{
			this.error = false;

			var filepath = this.value;
			if(newfilepath)
			{
				filepath = newfilepath;
			}

			var myself = this;

			tmaxios.get('/api/v1/filerestrictions',{
				params: {
					'url':			data.urlinfo.route,
					'filename': 	filepath,
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
					myself.error = myself.$filters.translate(error.response.data.message);
					myself.error
//					eventBus.$emit('publishermessage', message);
				}
			});
		},
		updaterestriction()
		{
			this.error = false;

			var filepath = this.value;
			if(!filepath)
			{
				this.error = 'File is missing for a restriction.';
			}

			var resself = this;

			tmaxios.post('/api/v1/filerestrictions',{
				'url':			data.urlinfo.route,
				'filename': 	filepath,
				'role': 		this.selectedrole,
			})
			.then(function (response) {

			})
			.catch(function (error){ 
				resself.error = 'some error update file restrictions';
			});
		},
		onFileChange( e )
		{
			this.error = false;

			if(e.target.files.length > 0)
			{
				let uploadedFile = e.target.files[0];
				let size = uploadedFile.size / 1024 / 1024;
				
				if (size > this.maxsize)
				{
					let message = "The maximal size of a file is " + this.maxsize + " MB";

					// show error in component
					eventBus.$emit('publishermessage', message);
				}
				else
				{
					self.load = true;

					self = this;

					let reader = new FileReader();
					reader.readAsDataURL(uploadedFile);
					reader.onload = function(e) 
					{
						tmaxios.post('/api/v1/file',{
							'file':				e.target.result,
							'name': 			uploadedFile.name
						})
					    .then(function (response) {
					    	self.filetitle = response.data.fileinfo.title;
					    	self.selectedrole = 'all';
							self.update(response.data.filepath);
					    })
					    .catch(function (error)
					    {
					    	if(error.response)
					    	{
					    		self.error = 'error update file';
					    		console.info(error.response);
	/*				        	publishController.errors.message = error.response.data.errors; */
					      	}
					    });
					}
				}
			}
		}
	}
})