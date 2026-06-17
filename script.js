const dataRaw = await fetch('./task_data/ExamData.json')
const data = await dataRaw.json()

const startButton = document.getElementById('start-button')
startButton.addEventListener('click', runApp)

const dataTaskTagsMap = new Map()
let numberCorrectTasks = 0, numberDoneTasks = 0, numberLoadedTasks = data.length
let currentLoadedTask = null

function createTag(tag, text, parent, classes, attributes) {
    const newTag = document.createElement(tag)
    if (text) {
        const newTagText = document.createTextNode(text)
        newTag.append(newTagText)
    }
    if (classes)
        newTag.classList.add(...classes)
    if (attributes)
        for (const [key, value] of Object.entries(attributes)) {
            newTag.setAttribute(key, value)
        }
    if (parent)
        parent.appendChild(newTag)
    return newTag
}

function createHeader() {
    const header = document.querySelector('header')
    const statusList = createTag('ul', '', header, ['task-status-list'])
    for (const task of data) {
        const statusLi = createTag('li', '', statusList)
        const statusButton = createTag('button', task.id.toString(), statusLi, ['task-status', 'is-unseen'], {id: `task-status-${task.id}`})

        dataTaskTagsMap.set(task.id, null)
        statusButton.addEventListener('click', () => {loadTask(task.id)})
    }
}

function createEmptyMain() {
    const mainTag = document.querySelector('main')
    mainTag.innerHTML = ''
    createTag('div', 'Choose the task', mainTag, ['empty-main-div'])
}

function loadTask(taskId) {
    const task = data.find(task => task.id === taskId)
    const mainTag = document.querySelector('main')
    if (task === undefined || !dataTaskTagsMap.has(taskId)) {
        throw new Error('No task found')
    } else if (dataTaskTagsMap.get(taskId) === null) {
        mainTag.innerHTML = ''
        const taskDiv = createTag('div', '', mainTag, ['task-div'])
        dataTaskTagsMap.set(taskId, taskDiv)

        createTag('h5', `Task number ${task.id}`, taskDiv, ['task-header'])
        createTag('span', task.question, taskDiv, ['task-question'])
        createTag('pre', task.code, taskDiv, ['task-code'])
        const answerList = createTag('ul', '', taskDiv, ['task-answer-ul'])
        for (let i = 0; i < task.options.length; i++) {
            const option = task.options[i]
            const answerLi = createTag('li', '', answerList, ['task-answer-li'])

            const inputId = `task-${task.id}-option-${i}`
            createTag('input', '', answerLi, ['task-answer-radio'], {
                type: 'radio',
                id: inputId,
                name: `task-${task.id}`,
                value: i.toString()
            })
            createTag('label', option, answerLi, ['task-answer-label'], {
                for: inputId
            })
        }
        const submitButton = createTag('button', 'Submit answer', taskDiv, ['task-submit-answer'], {id: `task-${task.id}-submit`})
        submitButton.addEventListener('click', () => {
            const selected = document.querySelector(`input[name="task-${task.id}"]:checked`)
            if (selected) {
                submitAnswerToTask(task.id, Number(selected.value))
            } else {
                alert('Please choose an answer before submitting')
            }
        })
    } else {
        mainTag.replaceChildren(dataTaskTagsMap.get(taskId))
    }
    currentLoadedTask = taskId
}

function submitAnswerToTask(taskId, optionId) {
    document.getElementById(`task-${taskId}-submit`).disabled = true
    for (const elem of document.querySelectorAll(`input[name="task-${taskId}"]`)) {
        elem.disabled = true
    }
    const task = data.find(task => task.id === taskId)
    const correct = task.correctIndex === optionId
    if (correct) {
        document.getElementById(`task-${taskId}-option-${optionId}`).parentElement.classList.add('task-answer-correct')
        document.getElementById(`task-status-${taskId}`).classList.replace('is-unseen', 'is-correct')
        numberCorrectTasks++
    } else {
        document.getElementById(`task-${taskId}-option-${optionId}`).parentElement.classList.add('task-answer-wrong')
        document.getElementById(`task-${taskId}-option-${task.correctIndex}`).parentElement.classList.add('task-answer-correct')
        document.getElementById(`task-status-${taskId}`).classList.replace('is-unseen', 'is-wrong')
    }
    numberDoneTasks++
    updateFooter()
}

function createFooter() {
    const footer = document.querySelector('footer')
    const footerDiv = createTag('div', '', footer, ['footer-div'])

    createTag('span', 'Tasks correct/done/loaded: ', footerDiv)
    createTag('span', `${numberCorrectTasks}/${numberDoneTasks}/${numberLoadedTasks}`, footerDiv, ['task-count-status'])
}

function updateFooter() {
    const footerStatusSpan = document.querySelector('.task-count-status')
    footerStatusSpan.textContent = `${numberCorrectTasks}/${numberDoneTasks}/${numberLoadedTasks}`
}

function runApp() {
    startButton.disabled = true
    createHeader()
    createEmptyMain()
    createFooter()
}
