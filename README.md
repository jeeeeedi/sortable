# 📋 TO-DO LIST

## ✅ FETCH: DONE
- OK- fetch data -- just use the code provided

## ✅ DISPLAY: DONE
- OK- table - dynamically created depending on the data
- OK- only show some of the fields
- OK- default 20 per page
- OK- select page size from 10, 20,50, 100 or all results


⬇️⬇️⬇️

## 🚧 SEARCH: IN PROGRESS
- OK- search bar (but no need for button)
- OK- search name as string
- OK- searching "man" should find all superheros with "man" in their name: doesn't matter if searchkey is at start, end, inside or exact content of the value (see quest fifty shades of cold)
- OK- interactive: filtered after every keystroke/character input (see keycodes symphony)

## 🚧 SORT: IN PROGRESS
- sortable alphabetically or numerically (ascending is a-z, 1-9)
- default: column name by ascending order
- first click on heading: sort data ascending
- consecutive clicks: toggle between ascending and descending
- numerical values: initially stored as strings. so need to be parsed (slice characters or regex the numbers then parseInt?). For example, when the weight column is sorted in ascending order, then "78 kg" must be displayed before "100 kg".
- missing values: always sorted last

## ??? SPEED
- 5 minutes loading?

## AUDIT
- review audit!

-----
## ⭐ BONUS

### DISPLAY
- Detail view. Clicking a hero from the list will show all the details and large image.

### SEARCH
- Specify the field that the search applies to.
- Custom search operators: include, exclude, fuzzy, equal, not equal, greater than and lesser than for numbers (including weight and height).

### DESIGN
- have fun

### URL
- Modify the URL with the search term, so that if you copy and paste the URL in a different tab, it will display the same column filters. If you have implemented detail view, the state of which hero is displayed should also form part of the URL.
