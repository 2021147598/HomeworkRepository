let cnt = 1;
fetch('product.json')
.then( response => response.json())
.then( json => init(json) )
.catch( err => console.error(`Error: ${err.message}`));

window.onscroll = () => {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
		load();
	}
};

const category = document.querySelector('#categoryChoosing');
const searchTerm = document.querySelector('#searchTerm');
const searchBtn = document.querySelector('#buttonSearch');
const main = document.querySelector('#mainPage');

let categoryGroup = [];
let filteredGroup = [];

let lastCategory = category.value;
let lastSearch = '';

function init(items) {
  
  filteredGroup = items;
  update();

  
  searchBtn.onclick = filtering;

  function filtering(e) {
    
    e.preventDefault();
    cnt = 1;
    categoryGroup = [];
    filteredGroup = [];

    // if the category and search term are the same as they were the last time a
    // search was run, the results will be the same, so there is no point running
    // it again — just return out of the function
    if (category.value === lastCategory && searchTerm.value.trim() === lastSearch) {
      return;
    } else {
      // update the record of last category and search term
      lastCategory = category.value;
      lastSearch = searchTerm.value.trim();
      // In this case we want to select all products, then filter them by the search
      // term, so we just set categoryGroup to the entire JSON object, then run selectProducts()
      if (category.value === 'All') {
        categoryGroup = items;
        selectItems();
      // If a specific category is chosen, we need to filter out the products not in that
      // category, then put the remaining products inside categoryGroup, before running
      // selectProducts()
      } else {
        // the values in the <option> elements are uppercase, whereas the categories
        // store in the JSON (under "type") are lowercase. We therefore need to convert
        // to lower case before we do a comparison
        const lowerCaseType = category.value.toLowerCase();
        // Filter categoryGroup to contain only products whose type includes the category
        categoryGroup = items.filter( item => item.type === lowerCaseType );

        // Run selectProducts() after the filtering has been done
        selectItems();
      }
    }
  }
}

  // selectProducts() Takes the group of products selected by selectCategory(), and further
  // filters them by the tiered search term (if one has been entered)
  function selectItems() {
    // If no search term has been entered, just make the finalGroup array equal to the categoryGroup
    // array — we don't want to filter the products further.
    if (searchTerm.value.trim() === '') {
        filteredGroup = categoryGroup;
    } else {
      // Make sure the search term is converted to lower case before comparison. We've kept the
      // product names all lower case to keep things simple
      const lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();
      // Filter finalGroup to contain only products whose name includes the search term
      filteredGroup = categoryGroup.filter( item => item.name.includes(lowerCaseSearchTerm));
    }
    // Once we have the final group, update the display
    update();
  }

  // start the process of updating the display with the new set of products
  function update() {
    // remove the previous contents of the <main> element
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    // if no products match the search term, display a "No results to display" message
    if (filteredGroup.length === 0) {
      const para = document.createElement('p');
      para.className = 'msg';
      para.innerHTML = 'No results!';
      main.appendChild(para);
    // for each product we want to display, pass its product object to fetchBlob()
    } else {
        console.log(filteredGroup.length);
        load();
    }
  }

  function load() {
	for (let i = (cnt - 1) * 6; i < cnt * 6; i++) {
		if (i >= filteredGroup.length) {
			break;
		}
		fetchBlob(filteredGroup[i]);
	}
	
	if ((cnt - 1) * 6 >= filteredGroup.length) {
		cnt = filteredGroup.length;
	} else {
		cnt = cnt + 1;
	}
  }
  // fetchBlob uses fetch to retrieve the image for that product, and then sends the
  // resulting image display URL and product object on to showProduct() to finally
  // display it
  function fetchBlob(item) {
    // construct the URL path to the image file from the product.image property
    const url = item.image;
    // Use fetch to fetch the image, and convert the resulting response to a blob
    // Again, if any errors occur we report them in the console.
    fetch(url)
      .then( response => 
        response.blob()
      )
      .then( blob => {
          showItem(URL.createObjectURL(blob), item.name, item.price, item.info) 
        })
      .catch( err => console.error(`Fetch problem: ${err.message}`));
  }

  // Display a product inside the <main> element
  function showItem(imgURL, itemName, itemPrice, itemInfo) {
    const div = document.createElement('div');
	const img = document.createElement('img');

    div.className = 'display';
    div.id = itemName + '/' + itemPrice + '/' + itemInfo;
    div.addEventListener('click', explainDetail)

    img.src = imgURL;
    img.alt = itemName;
    img.className = 'newitem';

    main.appendChild(div);
    div.appendChild(img);
  }

  function explainDetail (e) {
	let targetID = e.target.parentNode.id;
	let detaillist = targetID.split('/');
	
	if (targetID.indexOf('explainDetail-') === -1) {
		e.target.parentNode.id = 'explainDetail-' + targetID;
		const detail = document.createElement('div');
		detail.className = 'item_detail';
		let str = '<br>이름: &nbsp;' + detaillist[0] + '<br>가격: &nbsp;' + detaillist[1] + ' 원<br>설명: &nbsp;' + detaillist[2];
		detail.innerHTML = str;
		document.getElementById(e.target.parentNode.id).appendChild(detail);

	} else {
		e.target.parentNode.id = targetID.substring(8);
		let chk = document.getElementById(e.target.parentNode.id);
		chk.removeChild(chk.childNodes[1]);
	}
  }
