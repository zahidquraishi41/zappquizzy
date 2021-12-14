const caretdownI = `<i class="fas fa-caret-down"></i>`
const caretupI = `<i class="fas fa-caret-up"></i>`
const noHistH1 = document.querySelector('#no-hist')
const rowDiv = document.querySelector('.row')
const hist = userScores()
const keys = Object.keys(hist)

const format_selector = key => 'id-' + key.replace(/[\W_]+/g, "x");

function createCollapser(id, name) {
    const elem = document.createElement('div')
    elem.classList.add('rounded', 'text-start', 'd-flex', 'text-light')
    elem.setAttribute('data-bs-toggle', 'collapse')
    elem.setAttribute('role', 'button')
    elem.setAttribute('aria-expanded', 'false')
    elem.setAttribute('aria-constrols', 'false')
    elem.setAttribute('href', `#${id}`)
    elem.innerHTML += `<span>${name}</span>`
    elem.innerHTML += `<i class="fas fa-caret-down ms-auto pe-3"></i>`
    return elem
}

if (keys.length > 0)
    noHistH1.style.display = 'none'

keys.forEach(key => {
    const row_id = format_selector(key)

    const main_collapser = createCollapser(row_id, key)
    rowDiv.append(main_collapser)

    const hiddenContent = document.createElement('div')
    hiddenContent.classList.add('collapse')
    hiddenContent.id = row_id
    rowDiv.append(hiddenContent)
    const table = document.createElement('table')
    table.classList.add('table', 'table-striped', 'snmtable')

    const tbody = document.createElement('tbody')
    tbody.innerHTML += `<tr>
        <td colspan="9">Average</td>
        <td>${hist[key]['average']}</td>
    </tr>`

    hist[key]['scores'].forEach(section => {
        const collapser = createCollapser(format_selector(section['section']), section['section'])
        tbody.append(collapser)

        /*         tbody.innerHTML += `<tr>
                <td colspan="9">Total</td>
                <td>${section['total']}</td>
                </tr>`
        
                tbody.innerHTML += `<tr>
                <td colspan="9">Attempted</td>
                <td>${section['attempted']}</td>
                </tr>`
        
                tbody.innerHTML += `<tr>
                <td colspan="9">Attempted</td>
                <td>${section['attempted']}</td>
                </tr>`
        
                tbody.innerHTML += `<tr>
                <td colspan="9">Attempted</td>
                <td>${section['attempted']}</td>
            </tr>` */

    })

    table.append(tbody)
    hiddenContent.append(table)

})
reApplyTheme()