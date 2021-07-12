import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

const URL = 'https://randomuser.me/api/?results=20'

const fetchData = async () => {
  try {
    const response = await fetch(URL)
    const data = await response.json()

    return data
  } catch (error) {
    console.log(error)
  }
}

enum SORT_TYPE {
  ASC = 'ASC',
  DESC = 'DESC',
  NONE = 'NONE'
}

function App() {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState([])
  const [originalRows, setOriginalRows] = useState([])
  const [sort, setSort] = useState(SORT_TYPE.NONE)
  const [sortFieldSelected, setSortFieldSelected] = useState(-1)
  const [search, setSearch] = useState('')

  const parse = (obj: any, isHeader = false) => {
    const h: string[] = []
    Object.keys(obj).forEach(k => {
      if (typeof obj[k] === 'string' || typeof obj[k] === 'number') {
        h.push(isHeader ? k : obj[k])
      } else {
        Object.keys(obj[k]).forEach(kk => h.push(isHeader ? `${k} - ${kk}` : obj[k][kk]))
      }
    })

    return h
  }

  const parseHeaders = useCallback((location: any) => {
    return parse(location, true)
  }, [])

  const parseLocations = useCallback((users: any) => {
    setHeaders(parseHeaders(users[0].location))
    const parsedRows = users.map((user: any) => {
      return parse(user.location)
    })
    setRows(parsedRows)
    setOriginalRows(parsedRows)
  }, [parseHeaders])

  useEffect(() => {
    fetchData().then(data => {
      // setDisplayData(data)
      parseLocations(data.results)
    })
  }, [parseLocations])

  const getNextSortType = () => {
    const newSort = sort === SORT_TYPE.NONE
      ? SORT_TYPE.ASC
      : sort === SORT_TYPE.ASC
        ? SORT_TYPE.DESC
        : SORT_TYPE.ASC

    setSort(newSort)
    return newSort
  }

  const sortRows = (index: number) => {
    setSortFieldSelected(index)
    const sortValue = getNextSortType() === SORT_TYPE.ASC ? [-1, 1] : [1, -1]
    const sortedRows = [...rows].sort((a: any, b: any): any => {
      return a[index] < b[index] ? sortValue[0] : a[index] > b[index] ? sortValue[1] : 0
    })
    setRows(sortedRows)
  }

  const searchRow = useCallback((value: string) => {
    const searchedRows = originalRows.filter((row: string[]) => {
      return row.findIndex(prop => {
        console.log(prop)
        return prop.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0
      }) >= 0
    })

    setRows(searchedRows)
  }, [originalRows])

  useEffect(() => {
    if (search.length > 2) {
      searchRow(search)
    }
  }, [search, searchRow])


  const clearSearch = () => {
    setRows(originalRows)
    setSearch('')
  }


  return (
    <div className="App">
      <label>Search: </label>
      <input value={search} onChange={event => setSearch(event.target.value)} />
      <button onClick={clearSearch}>Clear</button>
      <div className="locations headers">
        {headers.map((header, index) => (
          <span key={header} onClick={() => sortRows(index)} className={sortFieldSelected === index ? 'selected' : ""}>
            {header}
          </span>
        ))}
      </div>
      <div className="rows">
        {rows.map((userLocation: any, index: number) => (
          <div key={index} className="locations row">
            {userLocation.map((locationProp: any, i: number) => (
              <span key={i}>
                {locationProp}
              </span>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
