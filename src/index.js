// global imports: m and b
import State   from './state'
import Actions from './actions'
import View    from './view'
import './style.js'

const state   = State()
const actions = Actions(state)
const view    = View(state, actions)

m.mount(document.body, view)
