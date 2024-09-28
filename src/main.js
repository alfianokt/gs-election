import 'alpinejs';
import Cookies from 'js-cookie';
import navaid from 'navaid';
import api from './api';

function getApiKeyFromUrl() {
  const url = window.location.href; // Get the current URL
  const match = url.match(/#([^&]+)/); // Regex to capture the API key after #id=
  return match ? match[1] : null; // Return the API key or null if not found
}

const app = () => {
  const apiKey = getApiKeyFromUrl();

  // Application configuration
  const _config = {
    name: "Election", // Application name
    api: apiKey ? `https://script.google.com/macros/s/${apiKey}/exec` : null // Construct the API URL
  };

  return {
    _config,
    alertIcons: { 'warning': '⚠️', 'danger': '☠️', 'success': '👍' },
    state: {
      navbar: false,
      alert: {
        type: '',
        msg: ''
      },
      page: {
        on: '/',
        params: {}
      },
      loading: {
        show: false,
      },
    },
    form: {
      model: {
        token: '',
        candidate: {
          head: null,
          vice: null
        },
        attendanceCode: null
      }
    },
    candidates: [],
    router: null,

    async init() {
      // Fetch candidate data
      await api.getCandidates(this._config.api)
        .then(json => {
          if (json.ok) {
            this.candidates = json.data.candidates;
          } else {
            alert(json.msg);
          }
        })
        .catch(e => alert(e));

      let router = navaid();

      // Attach routes
      router
        // Home
        .on('/', () => {
          this.setPage();
        })
        // Show candidate
        .on('/candidates/:id', params => {
          const candidate = this.candidates.filter(el => el.id == params.id);

          // If candidate exists
          if (candidate.length >= 1) {
            scroll(0, 0); // Scroll to top
            this.setPage('candidate', params);
          } else {
            router.route('/', true);
          }
        })
        // Login
        .on('/login', () => {
          Cookies.get('_token') ? router.route('/choose', true) : this.setPage('login');
        })
        // Choose candidate
        .on('/choose', () => {
          if (!Cookies.get('_token')) {
            router.route('/login', true);
          }

          this.form.model.candidate.head = null;
          this.form.model.candidate.vice = null;
          this.setPage('choose', { id: null });
        })
        // Attendance code
        .on('/attendance-code', () => {
          this.form.model.attendanceCode ? this.setPage('attendance-code') : router.route('/choose', true);
        })
        .on('/logout', () => {
          Cookies.remove('_token', { path: '' });
          router.route('/login', true);
        })
        // All (not found)
        .on('/*', () => {
          router.route('/', true);
        });

      router.listen();
      this.router = router;
    },

    // Login
    async login() {
      if (this.state.loading.show) {
        return;
      }

      this.setLoading(true);

      const { token } = this.form.model;

      if (!token) {
        this.setAlert('warning', 'Token must be provided.');
      }

      if (token) {
        await api.login(this._config.api, { token })
          .then(json => {
            // Check response code
            if (json.ok) {
              // If user has already voted
              if (json.data.choice.head && json.data.choice.vice) {
                this.setAlert('warning', 'You have already voted.');
              } else {
                this.setAlert('success', 'Login successful.');
                Cookies.set('_token', token, { sameSite: 'strict' });
                setTimeout(() => {
                  this.form.model.token = null;
                  this.router.route('/choose', true);
                  this.setAlert();
                }, 1500);
              }
            } else {
              this.setAlert('warning', 'The token you entered is invalid.');
            }
          })
          .catch(e => this.setAlert('danger', e));
      }

      this.setLoading(false);
    },

    // Vote for a candidate
    async vote(item) {
      if (confirm('Are you sure?')) {
        this.form.model.candidate[item.position.toLowerCase()] = item.id;

        if (this.form.model.candidate.head && this.form.model.candidate.vice) {
          if (this.state.loading.show) {
            return;
          }

          this.setLoading(true);

          const token = Cookies.get('_token');
          const { head, vice } = this.form.model.candidate;

          if (!token) {
            this.setAlert('warning', 'Token is empty, please log in.');
            this.router.route('/login', true);
          }

          if (token) {
            await api.vote(this._config.api, { token, head, vice })
              .then(json => {
                if (json.ok) {
                  const { attendance_code } = json.data;

                  this.form.model.attendanceCode = attendance_code;
                  this.router.route('/attendance-code', true);
                } else {
                  this.setAlert('warning', json.msg);
                  this.router.route('/logout', true);
                }
              })
              .catch(e => this.setAlert('danger', e));
          }

          this.setLoading(false);
        } else {
          this.state.page.params.id = null;
        }
      }
    },

    // Check if logged in (has cookie)
    loggedIn() {
      return Cookies.get('_token');
    },

    // Set page data
    setPage(on = '/', params = {}) {
      this.state.page.on = on;
      this.state.page.params = params;
    },

    // Set alert message
    setAlert(type = '', msg = '') {
      this.state.alert.type = type;
      this.state.alert.msg = msg;
    },

    // Set loading state
    setLoading(show = false) {
      this.state.loading.show = show;
    }
  };
};

window.app = app;