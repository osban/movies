const State = () => ({
  // model
  list: [],
  movie: {},

  // state
  page: 'list',
  omdb: '',
  modal: null,
  snackbar: null,

  // list
  sort: 'alphabetic',
  filter: {},
  filters: {
    time: ['< Time', '1:30', '1:45', '2:00', '2:15', '2:30', '3:00', '5:00'],
    yrgt: ['> Year', '1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2015'],
    yrlt: ['< Year', '1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2015'],
    type: ['Type', 'movie', 'series'],
    genre: ['Genre', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
      'Film-Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'],
    disk: ['Disk'],
    seen: ['Seen', 'Yes', 'No']
  },
  search: '',
  checks: {},

  // info
  eps: [],

  // add
  find: '',
  show: '',
  qres: {},
  qpage: 0
})

export default State
