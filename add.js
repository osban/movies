import m from "mithril"
import s from "mithril/stream"
import Model from "./model"
import AddInfo from "./addinfo"
import AddList from "./addlist"

const Add = {
  oninit: ({state}) => {
    state.zoekterm = s("")
    state.zoektermi = s("")
    Model.state = ""
    Model.added = false

    // If reload, go to list page
    if (!Model.list.length) m.route.set("/")
  },

  view: ({state}) => [
    m('div',
      m('div.row',
        m('div.twelve columns',
          m('input.zoek', {
            type: 'text',
            placeholder: "find",
            onfocus: () => Model.added = false,
            oninput: m.withAttr('value', state.zoekterm),
            onkeypress: e => {
              if (e.keyCode === 13 && state.zoekterm() !== "") {
                Model.getquery(state.zoekterm())
                e.target.blur()
              }
            },
            onchange: () => {if (state.zoekterm() !== "") Model.getquery(state.zoekterm())}
          }),
          m('input.zoeki', {
            type: 'text',
            placeholder: "find by id",
            onfocus: () => Model.added = false,
            oninput: m.withAttr('value', state.zoektermi),
            onkeypress: e => {
              if (e.keyCode === 13 && state.zoektermi() !== "") {
                Model.getqueryid(state.zoektermi())
                e.target.blur()
              }
            },
            onchange: () => {if (state.zoektermi() !== "") Model.getqueryid(state.zoektermi())}
          }),
          Model.added && m('b.red', "Movie added!"),
          Model.searching && m('b.green', "Searching...")
        )
      ),
      Model.state === "error"
      ? (m('div.row.mtxx', m('h2', Model.error)))
      : Model.state === "found"
        ? m(AddInfo)
        : Model.state === "list" && m(AddList)
    )
  ]
}
export default Add
