import Modal    from './modal'
import Snackbar from './snackbar'

const Layout = ({attrs: {A}}) => {
  A.get()
  A.selclear()

  return {
    view: ({attrs: {S}, children}) =>
      m('div' +z`size 100vw 100vh; center; m 0 auto; bc #2f5dab; of hidden`,
        m('div' +z`m auto; bc #fff; prb 0; tac; rel; w 80%; h calc(100vh - 32px)`,
          m('img', {src: 'images/movies.png'}),
          children,
          S.modal && m(Modal, {S}),
          S.snackbar &&
          m('div' +z`abs; plb 50% 0; w 344`,
            m(Snackbar, {S})
          )
        )
      )
  }
}

export default Layout
