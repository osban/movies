import m from "mithril"
import Model from "./model"

const AddSeries = {
  initseasons: () => {
    Model.postdata.seasonsowned = Array(Number(Model.current.totalSeasons)).fill(false)
    Model.postdata.seasonsseen = Array(Number(Model.current.totalSeasons)).fill(false)
    Model.postdata.seasons = Number(Model.current.totalSeasons)
  },

  oninit: () => {
    AddSeries.initseasons()
    Model.initseasons = false
  },

  onbeforeupdate: () => {
    if (Model.initseasons) {
      AddSeries.initseasons()
      Model.initseasons = false
    }
  },

  view: () => [
    m('div',
      m('b', "owned:"),
      m('br'),
      Model.postdata.seasonsowned.map((item, i) => [
        m('span',
          m('input', {
            type: 'checkbox',
            name: i+1,
            onchange: e => Model.checkseasonsowned(e.target.checked, e.target.name)}
          ),
          m('b.season.labeltop', "Season " + (i+1))
        )
      ]),
      m('br'),
      m('b', "seen:"),
      m('br'),
      Model.postdata.seasonsseen.map((item, i) => [
        m('span',
          m('input', {
            type: 'checkbox',
            name: i+1,
            onchange: e => Model.checkseasonsseen(e.target.checked, e.target.name)}
          ),
          m('b.season.labeltop', "Season " + (i+1))
        )
      ])
    )
  ]
}
export default AddSeries
