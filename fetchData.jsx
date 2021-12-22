const Pagination = ({ items, pageSize, onPageChange }) => {
  // Part 2 code goes here
  const { Button } = ReactBootstrap;
  if(items.length <= 1) return null;

  let num = Math.ceil((items.length / pageSize));
  let pages = range(1, num);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item m-1">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  )
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      // Part 1, step 1 code goes here
      dispatch({ type: "FETCH_INIT"});
      try {
        const result = await axios(url);
        if(!didCancel){
          console.log(result.data.message.items)
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if(!didCancel){
          dispatch({ type: "FETCH_FAILURE"});
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('MIT');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://api.crossref.org/works',
    {
      message: {
        items: []
      },
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.message.items;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        // Part 1, step 2 code goes here
        <div className="row">
          {page.map((item) => (
            <div className="col-sm-6 p-2" key={item.DOI}>
            <div className="card">
              <div className="card-body">
                <a href={item.URL}><h5 className="card-title" href={item.URL}>{item.title[0]}</h5></a>
                <h6 className="card-subtitle mb-2 text-muted">{item["short-container-title"]}</h6>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
      <Pagination
        items={data.message.items}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById('root'));
