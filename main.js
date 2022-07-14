let listContainer = document.getElementById("listContainer");
let taskContainer = document.getElementById("taskContainer");
let taskViewContainer = document.getElementById("taskViewContainer");
let subTaskName = document.getElementById("newSubTaskNameInput");
let deleteTaskBtn = document.querySelector('.deleteTask');
let menuBtn = document.querySelector('.menu');
let nav = document.querySelector('nav');
var calendarEl = document.getElementById('calendar');
const calendarNav = document.querySelector('.calendar');
const isMobile = window.matchMedia("(max-width : 480px)").matches
let taskViewListEl = document.querySelector('.taskViewList');
let taskViewListUlEl = document.querySelector('.taskViewList ul');
const listSetEl = document.querySelector('#listSet h1');
const deleteListEl = document.getElementById('deleteList');

let lists = [];
let tasks = [];
let subtasks = {};
let todayTasks = [];

let activeList;
let activeTask;

document.querySelectorAll('.navBar:not(.calendar)').forEach(item => {
  item.addEventListener('click', ()=>{
    calendarEl.style.display = 'none';
  })
})

function updateScroll(){
  var element = document.getElementById("subtaskUl");
  element.scrollTop = element.scrollHeight;
}


calendarNav.addEventListener('click', ()=>{
  document.querySelectorAll('.active').forEach(e => e.classList.remove('active'))
  calendarNav.classList.add('active');
  // document.addEventListener('DOMContentLoaded', function() {
    taskContainer.style.display = 'none';
   
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth'
    });
    calendar.render();  
  // });
})

taskViewContainer
  .querySelector(".task_due_date")
  .setAttribute("min", new Date().toISOString().substring(0, 10));

menuBtn.addEventListener('click',function(){
   nav.classList.toggle('opened')
});

function addList(e) {
  let listInp = e.target.previousElementSibling;
  if (!listInp.value) {
    alert("Enter valid List Name");
    return;
  }
  let list = {
    name: listInp.value,
    createdOn: Date.now(),
    id: "list-" + Date.now(),
  };
  lists.push(list);
  localStorage.setItem("lists", JSON.stringify(lists));
  appendList(list);
  listInp.value = "";
  var ele = document.getElementById("navScroll");
  ele.scrollTop = ele.scrollHeight;
}

function deleteList(){
  let listName = this.parentElement.firstElementChild.textContent;
  console.log(listName);
  lists = lists.filter(del => del.name !== listName);
  localStorage.setItem("lists", JSON.stringify(lists));
  showList();
}

if(lists.length === 0){
  activeList = []
  listSetEl.textContent = 'No Active List';
}

function showList(){
  listContainer.innerHTML = ''
  lists.forEach(list =>{
    appendList(list)
  })
  if(lists.length === 0){
    activeList = []
    listSetEl.textContent = 'No List Found';
  }else{
      activeList = lists[0]
    } 
  currActiveList(activeList);
}

deleteListEl.addEventListener('click', deleteList);

function appendList(list) {
  let listLi = document.createElement("li");
  listLi.dataset.listId = list.id;
  listLi.textContent = list.name;
  listContainer.appendChild(listLi);
  listLi.addEventListener("click", function () {
    currActiveList(list);
  });
}

function currActiveList(list) {
  if(isMobile){
    nav.classList.remove('opened')
  }
  activeList = list;
  taskContainer.innerHTML = "";
  document.querySelectorAll('.active').forEach(e => e.classList.remove('active'))
  let activeListEl = listContainer.querySelector(".active");
  if (activeListEl) activeListEl.classList.remove("active");
  listContainer
    .querySelector(`[data-list-id="${list.id}"]`)
    .classList.add("active");

  document
    .querySelectorAll(".get_list_name")
    .forEach((el) => (el.innerText = list.name));

  let filterdTask = tasks.filter((task) => task.listId == activeList.id);

  activeList.task_count = filterdTask.length;

  filterdTask.forEach((task) => appendTask(task));

  document
    .querySelectorAll(".get_list_task_count")
    .forEach(task => task.innerText = filterdTask.length);

  taskViewBack();
}

function addTask() {
  let newTaskNameInput = document.getElementById("newTaskNameInput");

  if (newTaskNameInput.value == "") {
    alert("Enter valid Task Name");
    return;
  }
  let task = {
    name: newTaskNameInput.value,
    createdOn: Date.now(),
    id: "task-" + Date.now(),
    subtasks: [],
    listId: activeList.id,
    due_date: null,
    isImportant: false
  };
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  appendTask(task);
  let task_count = document.querySelector(".get_list_task_count");
  task_count.innerText = tasks.filter(
    (task) => task.listId == activeList.id
  ).length;

  var element = document.getElementById("taskContainer");
  element.scrollTop = element.scrollHeight;

  newTaskNameInput.value = "";
}

function appendTask(task) {
  let taskEl = document.createElement("div");
  taskEl.dataset.taskid = task.id;
  taskEl.className = "task";
  taskEl.innerHTML = `
        <h2>${task.name}</h2>
        <span><h4>${task.due_date ? new Date(task.due_date)
          .toISOString()
          .substring(0, 10) : ''}</h4> Due date</span>
          <div class="taskIcon">
          <div title="today" onclick="showTodayTasks()">
          <svg fill=${new Date(task.due_date).toDateString() == new Date().toDateString()?'blue': "black" } xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17 12c0 2.762-2.238 5-5 5s-5-2.238-5-5 2.238-5 5-5 5 2.238 5 5zm-9.184-5.599l-3.594-3.594-1.414 1.414 3.594 3.595c.402-.537.878-1.013 1.414-1.415zm4.184-1.401c.34 0 .672.033 1 .08v-5.08h-2v5.08c.328-.047.66-.08 1-.08zm5.598 2.815l3.594-3.595-1.414-1.414-3.594 3.595c.536.402 1.012.878 1.414 1.414zm-12.598 4.185c0-.34.033-.672.08-1h-5.08v2h5.08c-.047-.328-.08-.66-.08-1zm11.185 5.598l3.594 3.593 1.415-1.414-3.594-3.594c-.403.537-.879 1.013-1.415 1.415zm-9.784-1.414l-3.593 3.593 1.414 1.414 3.593-3.593c-.536-.402-1.011-.877-1.414-1.414zm12.519-5.184c.047.328.08.66.08 1s-.033.672-.08 1h5.08v-2h-5.08zm-6.92 8c-.34 0-.672-.033-1-.08v5.08h2v-5.08c-.328.047-.66.08-1 .08z"/></svg></div>
          <div title="Important" class="important" data-taskid=${task.id}>
          <svg fill=${task.isImportant?'blue': 'black'}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M19 24l-7-6-7 6v-24h14v24z" />
        </svg>
        </div>
        <span><h4>${task.subtasks?.length} </h4>subtasks</span>
        </div>
    `;
  taskEl.querySelector('h2').addEventListener("click", function () {
    taskShow(task);
  });
  taskEl.querySelector('.important').addEventListener('click',function(){
    console.log(this.dataset.taskid);
    tasks = tasks.map(task => {
      if(task.id == this.dataset.taskid){
        task.isImportant = !task.isImportant
      }return task
    })
    localStorage.setItem('tasks',JSON.stringify(tasks))
    currActiveList(activeList)
  })

  taskContainer.appendChild(taskEl);
}

function taskShow(task) {
  activeTask = task;
  taskContainer.style.display = "none";
  taskViewContainer.style.display = "block";

  taskViewContainer.querySelector(".task_sub_tasks").innerHTML = "";
  if (task.subtasks.length)
    for (const subtask of task.subtasks) {
      appendSubTask(subtask);
    }

  taskViewContainer.querySelector(".task_name").innerText = task.name;
  taskViewContainer.querySelector(".task_created_on").innerText = new Date(
    task.createdOn
  ).toLocaleDateString();

  if (task.due_date) {
    console.log(task.due_date);
    taskViewContainer.querySelector(".task_due_date").value = new Date(
      task.due_date
    )
      .toISOString()
      .substring(0, 10);
  } else {
    taskViewContainer.querySelector(".task_due_date").value = "";
  }
}

function setDueDate(e) {
  tasks = tasks.map((task) => {
    if (task.id == activeTask.id) {
      task.due_date = e.target.value;
      activeTask = task;
    }
    return task;
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function taskViewBack(resetTasksView = false) {
  taskContainer.style.display = "block";
  taskViewContainer.style.display = "none";
  if (resetTasksView) currActiveList(activeList);
}

function addSubTask() {
  if (!subTaskName.value) {
    alert("Invalid Subtask Name");
    return;
  }
  let subtask = {
    name: subTaskName.value,
    createdOn: Date.now(),
    id: "subtask-" + Date.now(),
  };
  activeTask.subtasks.push(subtask);
  tasks = tasks.map(task => task.id == activeTask.id ? activeTask : task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  appendSubTask(subtask);
  subTaskName.value = "";
  updateScroll();
}

function appendSubTask(subtask) {
  let task_sub_tasks = taskViewContainer.querySelector(".task_sub_tasks");
  let subTaskWrap = document.createElement('div')
  subTaskWrap.innerHTML = `<div class="subTaskStyle"><input class="subTaskCheck" type="checkbox"> </input>
  <li>${subtask.name}</li>
  </div>
  <div title="delete sub task" class="deleteSubTaskBtn">
<svg title="delete sub task" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-1  0c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/></svg></div>`

  task_sub_tasks.appendChild(subTaskWrap);
  let deleteSubTaskBtn = document.querySelectorAll('.deleteSubTaskBtn svg');
  deleteSubTaskBtn.forEach(deleteSvg =>{
    // deleteSvg.classList.add('deleteSubTask');
    deleteSvg.dataset.subtaskid = subtask.id
    deleteSvg.addEventListener('click', deleteSubTask)
  })
}

function deleteTask(){
  if(confirm('Are you sure')){
    tasks = tasks.filter(task => task.id !== activeTask.id)
    localStorage.setItem('tasks',JSON.stringify(tasks))
    taskViewBack(true)
  }
}
function deleteSubTask() {
  console.log(this.dataset.subtaskid);
  activeTask.subtasks = activeTask.subtasks.filter(subtask => subtask.id !== this.dataset.subtaskid)
  tasks = tasks.map(task => task.id == activeTask.id ? activeTask : task)
  localStorage.setItem('tasks',JSON.stringify(tasks))
  taskShow(activeTask);
}
deleteTaskBtn.addEventListener('click',deleteTask);

function showImportantTasks() {
  if(isMobile){
    nav.classList.remove('opened')
  }
  const importantTasks = tasks.filter(task => task.isImportant)
  taskContainer.innerHTML = "";
  let activeListEl = document.querySelector(".active");
  if (activeListEl) activeListEl.classList.remove("active");
  document
    .querySelector('nav .important')
    .classList.add("active");

  document
    .querySelectorAll(".get_list_name")
    .forEach((el) => (el.innerText = 'Important'));

  activeList.task_count = importantTasks.length;

  importantTasks.forEach((task) => appendTask(task));

  document
    .querySelectorAll(".get_list_task_count")
    .forEach((task) => (task.innerText = importantTasks.length));

  taskViewBack();

}

function showTodayTasks() {
  // todayTasks.push()
  if(isMobile){
    nav.classList.remove('opened')
  }
  const todayDueDateTasks = tasks.filter(task => new Date(task.due_date).toISOString().substring(0,10) == new Date().toISOString().substring(0,10))

  taskContainer.innerHTML = "";
  let activeListEl = document.querySelector(".active");
  if (activeListEl) activeListEl.classList.remove("active");
  document
    .querySelector('nav .today')
    .classList.add("active");

  document
    .querySelectorAll(".get_list_name")
    .forEach((el) => (el.innerText = 'Today'));

  activeList.task_count = todayDueDateTasks.length;

  todayDueDateTasks.forEach((task) => appendTask(task));

  document
    .querySelectorAll(".get_list_task_count")
    .forEach((task) => (task.innerText = todayDueDateTasks.length));

  // taskViewBack();
}


if (localStorage.getItem("lists") !== null) {
  lists = JSON.parse(localStorage.getItem("lists")) || [];
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  for (const list of lists) {
    appendList(list);
  }
  currActiveList(lists[0]);
}
