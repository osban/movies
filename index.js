// import stuff
import m from "mithril"

import Layout from "./layout"
import MovieList from "./list"
import MovieView from "./view"
import MovieEdit from "./edit"
import MovieAdd from "./add"

// routes
m.route(document.body, "/", {
  "/": {
    render() {
      return m(Layout, m(MovieList))
    }
  },
  "/view/:id": {
    render(vnode) {
      return m(Layout, m(MovieView, vnode.attrs))
    }
  },
  "/edit/:id": {
    render(vnode) {
      return m(Layout, m(MovieEdit, vnode.attrs))
    }
  },
  "/add/": {
    render() {
      return m(Layout, m(MovieAdd))
    }
  }
})
