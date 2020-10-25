import Addone  from './addone'
import Addlist from './addlist'

const Add = {
  view: ({attrs: {S,A}}) =>
    m('div' +z`tal`,
      m('div' +z`h 36; pl 36; mb 24; bb 1 solid #d2d2d2`,
        m('span',
          m('a.material-icons' +z`mr 24; c #616161; pointer; :hover {c #349cfb}`, {
            onclick: () => {S.page = 'list'; m.route.set('/list')}
          }, 'home')
        )
      ),
      m('span' +z`rel`,
        m('input' +z`bsi; size 300 36; ml 36; pl 40; bo 1 solid #d2d2d2; fs 13`, {
          placeholder: 'Search title...',
          onfocus: () => {
            S.show = ''
            S.qres = {}
            S.qone = {}
          },
          oninput: e => S.find = e.target.value,
          onkeyup: e => {
            S.find = e.target.value
            if (e.keyCode === 13) e.target.blur()
          },
          onblur: e => {
            if (e.target.value) {
              S.show = 'searching'
              A.query()
            }
          },
          value: S.find
        }),
        m('span.material-icons' +z`abs; plt 42 -1; c #acacac`, 'search'),
        m('span.material-icons' +z`abs; plt 305 -2; c #616161; pointer; :hover {c #349cfb}`, {
          onclick: () => S.find = ''
        }, 'close')
      ),
      m('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'`,
        m('div' +z`ga left`,
          S.show === 'one'  ? m(Addone, {S,A})  :
          S.show === 'list' ? m(Addlist, {S,A}) :
          S.show === 'Searching...' || S.show === 'No results.' &&
          m('h3' +z`pl 36; mt 24`, S.show)
        ),
        m('div' +z`ga right`,
          S.show === 'list' && Object.keys(S.qone).length > 0 &&
          m(Addone, {S,A})
        )
      )
    )
}

export default Add
