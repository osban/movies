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
      Model.postdata.seasonsowned.map((item, season) => {
        season++
        return m('span',
          m('input', {
            type: 'checkbox',
            name: season,
            onchange: function() {Model.checkseasonsowned(this.checked, this.name)}}
          ),
          m('b.season.labeltop', "Season " + season)
        )
      }),
      m('br'),
      m('b', "seen:"),
      m('br'),
      Model.postdata.seasonsseen.map((item, season) => {
        season++
        return m('span',
          m('input', {
            type: 'checkbox',
            name: season,
            onchange: function() {Model.checkseasonsseen(this.checked, this.name)}}
          ),
          m('b.season.labeltop', "Season " + season)
        )
      })
    )
  ]
}
export default AddSeries
