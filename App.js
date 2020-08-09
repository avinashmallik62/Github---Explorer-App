import React from "react";
import Search from "./components/search";
import UserCard from "./components/UserCard";
import RepoCard from "./components/RepoCard";
const PAGE_SIZE = 10;
class App extends React.Component {
  state = {
    user: null,
    repos: [],
    userDataError: null,
    loading: false,
  };
  fetchUserData = async (username) => {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (res.ok) {
      const data = await res.json();
      return { data };
    }
    const error = (await res.json()).message;
    return { error };
  };

  fetchRepos = async (username,page) => {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?page=${page}&per_page = ${PAGE_SIZE}`
    );
    if (res.ok) {
      const data = await res.json();
      return { data };
    }
    const error = (await res.json()).message;
    return { error };
  };
  //fetch github api
  fetchData = async (username) => {
    this.setState({ loading: true }, async () => {
      try {
        const [user, repos] = await Promise.all([
          this.fetchUserData(username),
          this.fetchRepos(username,1),
        ]);
        if (user.data !== undefined && repos.data !== undefined) {
          return this.setState({
            user: user.data,
            repos: repos.data,
            loading: false,
          });
        }
        this.setState({
          userDataError: user.error,
          reposError: repos.error,
          loading: false,
        });
      } catch (err) {
        this.setState({
          error: "There was some error!",
          loading: false,
        });
      }
    });
  };
  loadPage = async (page) => {
    const { data } = await this.fetchRepos(this.state.user.login,page);
    if (data) {
      this.setState((state) => ({
        repos: data,
        page,
      }));
    }
  };
  render() {
    const {
      userDataError,
      reposError,
      loading,
      user,
      repos,
      page,
    } = this.state;
    const renderRepos = !loading && !reposError && !!repos.length;
    return (
      <div>
        <Search fetchData={this.fetchData} />
        <div className="container">
          <div className="text-center pt-5">
            {loading && <p>Loading.....</p>}
            {userDataError && <p className="text-danger">{userDataError}</p>}
          </div>
          {!loading && !userDataError && user && <UserCard user={user} />}
          {reposError && <p className="text-danger">{reposError}</p>}
          {renderRepos && (
            <React.Fragment>
              <div className="mb-4">
               {[...new Array(Math.ceil(user.public_repos / PAGE_SIZE))].map(
                (_, index) => (
                  <button key={index} className="btn btn-success mr-2" onClick = {() => this.loadPage(index+1)
                  }>
                    {index + 1}
                  </button>
                ),
              )}
              </div>
   
              {repos.map(repo => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default App;
