const clone = item => JSON.parse(JSON.stringify(item))
const omdbapi = (t, q, omdb) => 'http://private.omdbapi.com/?' + t + '=' + q + '&apikey=' + omdb
const isprev = p => (((Number(p) - 1) * 10) + 1) !== 1
const isnext = (p, tot) => !(Number(p) * 10 >= tot || Number(p) * 10 > 1000)

const filtdisk = state => {
  const disks = [...new Set(state.list.map(x => x.disk))].sort((a,b) => a-b)
  state.filters.disk = [...['Disk'], ...disks]
  // if the last movie on a disk has been deleted
  if (!state.filters.disk.includes(state.filter.disk)) state.filter.disk = 'Disk'
}

const postprep = qone => {
  const obj = {}
  const props = [
    'Actors','Country','Director','Genre','Language','Metascore',
    'Plot','Poster','Runtime','Title','Type','Writer','Year','imdbID',
    'imdbRating','seasonsowned','seasonsseen','disk','seen'
  ]
  Object.keys(qone)
  .filter(x => props.includes(x))
  .forEach(x => {
    const actions = {
      Actors:     () => {obj['cast']    = qone[x]},
      Runtime:    () => {obj['runtime'] = qone[x] !== 'N/A' ? qone[x].split(' ')[0] : ''},
      imdbID:     () => {obj['imdbid']  = qone[x]},
      imdbRating: () => {obj['rating']  = qone[x]}
    }
    if (actions.hasOwnProperty(x)) actions[x]()
    else obj[x.toLowerCase()] = qone[x]
  })
  obj['originaltitle'] = ''
  obj['notes']         = ''

  qone = clone(obj)
  return obj
}

const update = (movie, res) => new Promise((rs,rj) => {
  if (movie.rating !== res.imdbRating || movie.metascore !== res.Metascore || movie.poster !== res.Poster ||
      (movie.type === 'series' && Number(res.totalSeasons) > movie.seasonsowned.length)) {
    movie.rating    = res.imdbRating
    movie.metascore = res.Metascore
    movie.poster    = res.Poster
    if (movie.type === 'series' && Number(res.totalSeasons) > movie.seasonsowned.length) {
      for (let i=0; i < Number(res.totalSeasons) - movie.seasonsowned.length + 1; i++) {
        movie.seasonsowned.push(false)
        movie.seasonsseen.push(false)
      }
    }

    m.request({
      method: 'PUT',
      url: '/' + movie._id,
      body: movie
    })
    .then(rs)
    .catch(rj)
  }
  else rs()
})

const error = (state, err) => {
  state.modal = {
    type: 'error',
    content: {
      text: `(${err.code}) ${err.response.error.message}`
    }
  }
}

const Actions = state => ({
  get: () =>
    m.request('/all')
    .then(res => {
      state.list = res.list
      state.omdb = res.omdb
      // init disk filter array
      filtdisk(state)
      // init checks
      state.list.forEach(x => state.checks[x._id] = false)
      state.checks['all'] = false
    })
    .catch(err => error(state, err)),
  post: () =>
    m.request({
      method: 'POST',
      url: '/',
      body: postprep(state.qone)
    })
    .then(res => {
      state.list.push(res)
      // re-init disk filter
      filtdisk(state)
      state.snackbar = {
        text: 'Movie/series added.',
        atext: 'view',
        action: () => {
          state.movie = res
          state.page = 'info'
          state.snackbar = null
        }
      }
    })
    .catch(err => error(state, err)),
  put: () =>
    m.request({
      method: 'PUT',
      url: '/' + state.movie._id,
      body: state.movie
    })
    .then(() => {
      const index = state.list.findIndex(x => x._id === state.movie._id)
      state.list[index] = clone(state.movie)
      // re-init disk filter
      filtdisk(state)
      state.snackbar = {text: 'Movie(s)/series updated.'}
    })
    .catch(err => error(state, err)),
  del: solo => {
    if (solo) state.checks[state.movie._id] = true

    const delone = (id, title) =>
      m.request({
        method: 'DELETE',
        url: '/' + id + '/' + title
      })
      .then(() => {
        state.list = state.list.filter(x => x._id !== id)
        state.checks[id] = false
        // re-init disk filter
        filtdisk(state)
      })
      .catch(err => error(state, err))

    Promise.all(
      Object.keys(state.checks)
      .filter(x => state.checks[x])
      .map(x => {
        const movie = state.list.find(y => y._id === x)
        delone(x, movie.title)
      })
    )
    .then(() => {
      state.page = 'list'
      state.snackbar = {text: 'Movie(s)/series deleted.'}
    })
  },

  mm2hm: mins => {
    let time = ''
    if (Number(mins) !== 0) {
      const hh = Number(mins) / 60 | 0
      let mm = Number(mins) % 60
      if (mm < 10) mm = '0' + mm
      time = `${hh}:${mm}`
    }
    return time
  },

  checkit: which => {
    if (which === 'all') {
      Object.keys(state.checks).forEach(x => state.checks[x] = !state.checks[x])
    }
    else state.checks[which] = !state.checks[which]
  },

  selmovie: id => {
    const index = state.list.findIndex(x => x._id === id)
    // update data if needed
    m.request({url: omdbapi('i', state.list[index].imdbid, state.omdb)})
    .then(res => {
      update(state.list[index], res)
      .then(() => {
        state.movie = clone(state.list[index])
        state.page = 'info'
        state.season = 0
      })
      .catch(err => error(state, err))
    })
  },

  setfilter: (which, value) => {
    state.filter[which] = 
      value === 'Yes' ? true :
      value === 'No'  ? false :
      value
  },
  selclear: () => Object.keys(state.filters).forEach(x => state.filter[x] = state.filters[x][0]),

  seen: () => {
    const seenone = id => {
      state.list[state.list.findIndex(x => x._id === id)].seen = true

      return m.request({
        method: 'PUT',
        url: '/' + id,
        body: state.list[state.list.findIndex(x => x._id === id)]
      })
      .then(() => {
        state.checks[id] = false
        state.snackbar = {text: 'Movie(s)/series updated.'}
      })
      .catch(err => error(state, err))
    }

    Promise.all(
      Object.keys(state.checks)
      .filter(x => state.checks[x] === true)
      .map(x => seenone(x))
    )
  },

  geteps: nr =>
    m.request({url: omdbapi('i', state.movie.imdbid + '&Season=' + nr, state.omdb)})
    .then(result => {
      state.eps = result
      state.season = nr
    })
    .catch(err => error(state, err)),

  query: () =>
    m.request({url: omdbapi('s', state.find, state.omdb)})
    .then(result => {
      state.qres = result
      if (state.qres.Response === 'False') state.show = 'No results.'
      else {
        if (state.qres.totalResults !== '1') {
          state.qpage = 1
          state.show  = 'list'
        }
        else {
          m.request({url: omdbapi('i', state.qres.Search[0].imdbID, state.omdb)})
          .then(res => {
            state.qone = res
            state.qone.seen = false
            state.show = 'one'
          })
        }
      }
    })
    .catch(err => error(state, err)),

  queryid: id =>
    m.request({url: omdbapi('i', id, state.omdb)})
    .then(res => {
      state.qone = res
      state.qone.seen = false
      if (state.qone.totalSeasons) {
        state.qone.seasonsowned = [...new Array(Number(state.qone.totalSeasons)).fill(false)]
        state.qone.seasonsseen  = [...new Array(Number(state.qone.totalSeasons)).fill(false)]
      }
    })
    .catch(err => error(state, err)),

  isporn: porn => porn === 'prev'
    ? isprev(state.qpage)
    : isnext(state.qpage, Number(state.qres.totalResults)),

  querypage: porn => {
    const page = '&page=' + (porn === 'next' ? ++state.qpage : --state.qpage)
    return m.request({url: omdbapi('s', state.find + page, state.omdb)})
    .then(result => {state.qres = result})
    .catch(err => error(state, err))
  }
})

export default Actions
