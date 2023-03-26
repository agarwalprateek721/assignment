import './App.css';
import { useRef, useState, useEffect } from "react";
import useDebounce from './useDebounce';

function App() {
  const [list, setList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const listRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetch("http://www.mocky.io/v2/5ba8efb23100007200c2750c")
      .then((res) => res.json())
      .then((json) => {
        setList(json);
      }).catch(err => {
        console.log(`error from server: ${err}`)
      });
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  const filterData = (val) => {
    const data = list.filter(item => {
      return (
        item.name.toLowerCase().includes(val) || 
        item.id.toLowerCase().includes(val) ||
        item.address.toLowerCase().includes(val) ||
        item.pincode.toLowerCase().includes(val) ||
        item.items.some((itm) => {
          if (itm.toLowerCase().includes(val)) {
            item.foundItem = val;
          } else {
            delete item.foundItem;
          }
  
          return itm.toLowerCase().includes(val);
        })
      );
    })
    return data;
  };

  useDebounce(() => {
    const data = filterData(inputVal);
    setFilteredData(data);
  }, [list, inputVal], 800
);


  const handleCardClick = (index) => {
    setSelectedItem(index);
    
    listRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      const lastIndex = filteredData.length - 1;
      const nextIndex =
        (selectedItem === null ? -1 : selectedItem) + direction;
      const index =
        nextIndex < 0 ? lastIndex : nextIndex > lastIndex ? 0 : nextIndex;
      setSelectedItem(index);
      list.current?.children[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }
  };


  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setInputVal(inputValue.toLowerCase()); 
    setSelectedItem(null);
  };

  const highlighter = (result) =>
    result.split(new RegExp(`(${inputVal})`, `gi`)).map((piece, index) => {
      return (
        <span
          key={index}
          style={{
            color:
              piece.toLowerCase() === inputVal.toLocaleLowerCase()
                ? "green"
                : "black"
          }}
        >
          {piece}
        </span>
      );
    });

  return (
    <div className="App">
      <div className="input-div">
        <input onChange={handleInputChange} type="text" />
      </div>

      {inputVal.length !== 0 &&
        <ul className="content-div" ref={listRef}>
          {filteredData.length > 0 ?
            filteredData.map((item, index) => (
              <li
                  key={item.id}
                  className={`LI ${
                      selectedItem === index ? "focussed" : "not-focussed"
                  }`}
                  onClick={() => handleCardClick(index)}
                  onMouseEnter={() => setSelectedItem(index)}
                  onMouseLeave={() => setSelectedItem(null)}
              >
                  <p>{highlighter(item.id)}</p>
                  <p>{highlighter(item.name)}</p>
                  <p>{highlighter(item.address)}</p>
                  {item.foundItem && 
                  <p>
                      <small>{highlighter(item.foundItem)} <span>found in items</span></small>  
                  </p>
                  }
                  <p>{highlighter(item.pincode)}</p>
              </li>
              ))
          :
            <p style={{ textAlign: 'center' }}>No User found</p>
          }
    </ul>
      }
    </div>
  );
}

export default App;
