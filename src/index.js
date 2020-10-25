// global imports: m and z
import state   from './state'
import actions from './actions'

import Layout  from './layout'
import Login   from './login'
import List    from './list'
import Movie   from './movie'
import Add     from './add'

import './style.js'

const S = state()
const A = actions(S)

const routes = {
  '/'     : {
    onmatch: () => {
      if (sessionStorage.getItem('movtok')) m.route.set('/list')
      else m.route.set('/login')
    }
  },
  '/login': {render: () => m(Login, {A})},
  '/list' : {render: () => m(Layout, {S,A}, m(List,  {S,A}))},
  '/movie': {render: () => m(Layout, {S,A}, m(Movie, {S,A}))},
  '/add'  : {render: () => m(Layout, {S,A}, m(Add,   {S,A}))}
}

const check = () => {
  if (!sessionStorage.getItem('movtok')) m.route.set('/login')
}

const skip = ['/', '/login']
Object.keys(routes).forEach(x => {
  if (!skip.includes(x)) routes[x].onmatch = check
})

m.route(document.body, '/', routes)
