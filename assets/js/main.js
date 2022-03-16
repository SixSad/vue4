Vue.component('todo-list', {
    props: ['list', 'list_index'],
    data: function () {
        return {
            newItem: '',
            colors: ['grey', 'lightPink', 'lightGreen', 'Yellow', 'lightBlue'],
        }
    },
    methods: {
        setColor() {
            let index = this.colors.indexOf(vm.records.find(value => value.id === this.list_index).color);
            vm.records.find(value => value.id === this.list_index).color = this.colors[index + 1];
            vm.saveItems();
        },
        addItem() {
            if (this.newItem !== '') {
                vm.records.find(value => value.id === this.list_index).items.push({
                    title: this.newItem,
                    done: 'none',
                    priority: false
                });
                vm.saveItems();
                this.newItem = '';
            }
        },
        deleteRecord() {
            vm.records.splice(vm.records.findIndex(value => value.id === this.list_index), 1);
            vm.searchResult.splice(vm.searchResult.findIndex(value => value.id === this.list_index), 1);
            vm.saveItems();
        }

    },
    template: `

    <div class="bg-white border mt-4">
        <header class="border-bottom">
            <div v-bind:style="{backgroundColor:list.color,height: 10 + 'px' }"></div>
                <div class="d-flex px-4 py-3 justify-content-between">
                    <h2>{{list.title}}</h2>
                    <div class="col-1 d-flex justify-content-between">
                    <img src="assets/img/trash.png" alt="" style="height: 25px;height: 25px;cursor: pointer" @click="deleteRecord">
                    <img src="assets/img/fill.png" alt="" style="height: 25px;height: 25px;cursor: pointer" @click="setColor"> 
                </div>
            </div>
        </header>
        
        <div>
            <transition-group name="todo">
                <todo-item v-for="(item,index) in list.items" :index="index" :item="item" :list_index="list_index" :key="item"></todo-item>
            </transition-group>
            
        </div>
        
        <div class=" border-bottom p-3">
            <div class="input-group">
                <input type="text" class="form-control border-0 fs-5 shadow-none" aria-label="Text input with checkbox" placeholder="Add new" v-model.lazy="newItem" @keyup.enter="addItem">
            </div>
        </div>
        
        <div class=" mt-3 px-3">
            <p>Created: {{list.time}}</p>
        </div>  
    </div>
`
});

Vue.component('todo-item', {
    props: ['item', 'index', 'list_index'],
    methods: {
        deleteItem() {
            vm.records.find(value => value.id === this.list_index).items.splice(this.index, 1);
            vm.saveItems();
        },
        setDone() {
            this.item.done = (this.item.done === 'none') ? 'line-through' : 'none'
            vm.saveItems();
        },
        setPriority() {
            this.item.priority = !this.item.priority
            vm.saveItems();
        },
    },
    template: `
<div class="py-3 px-2 pe-4 border-bottom d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center">
        <div class="col-1 p-1 me-3">
           <img src="assets/img/pin.png" alt="" class="img-fluid" @click="setPriority"  :style="{cursor:'pointer'}">
        </div>
        <h4 @click="setDone" :style="[item.priority?{color:'red'}:{color:'black'},{textDecoration:item.done,cursor: 'pointer'}]">{{item.title}}</h4>
    </div>
    <img src="assets/img/trash.png" alt="" style="height: 20px;height: 20px;cursor: pointer" @click="deleteItem"> 
</div>
    `
});


const vm = new Vue({
    el: '#app',
    data: {
        id: 0,
        records: [],
        searchResult: [],
        filterRecords: [],
        title: '',
        pages: ['main', 'addRecord'],
        currentPage: 'main',
        searchQuery: '',
    },

    created() {
        this.id = Number(JSON.parse(localStorage.getItem("id")));
        this.records = JSON.parse(localStorage.getItem("records") || '[]');
    },

    computed: {
        currentDate() {
            let time = new Date();
            let hours = (time.getHours() > 9) ? time.getHours() : '0' + time.getHours();
            let minutes = (time.getMinutes() > 9) ? time.getMinutes() : '0' + time.getMinutes();
            time = hours + ":" + minutes;
            return time;
        },
    },

    methods: {

        saveItems() {
            const parsed = JSON.stringify(this.records);
            localStorage.setItem('records', parsed);
            localStorage.setItem('id', this.id);
        },

        move(page = 'main') {
            this.currentPage = page;
        },

        addRecord() {
            if (this.title === '') {
                return this.move('addRecord');
            }
            this.records.push({id: this.id, title: this.title, items: [], time: this.currentDate, color: '',})
            this.saveItems();
            this.title = '';
            this.id++;
            this.currentPage = 'main';
            return true;

        },

        sortRecords(type = '') {
            if (type === 'name') {
                this.records = this.records.sort((a, b) => {
                    return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                });
            }
            if (type === 'priority') {
                this.records = this.records.sort((a, b) => {
                    return (a.items.filter(item => item.priority === true).length > b.items.filter(item => item.priority === true).length) ? -1 : (a.items.filter(item => item.priority === true).length < b.items.filter(item => item.priority === true).length) ? 1 : 0;
                });
            }
            if (type === 'date') {
                this.records = this.records.sort((a, b) => {
                    return (a.time < b.time) ? -1 : (a.time > b.time) ? 1 : 0;
                });
            }
        },

        search() {
            if (this.searchQuery !== '') {
                this.searchResult = this.records.filter(record => record.title.includes(this.searchQuery));
                this.searchQuery = '';
                return true;
            }
            return this.searchResult = [];
        },
    }
});
