import { useEffect, useRef, useState } from 'react'
import './ListControls.css'

function ListControls({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  sortValue,
  onSortChange,
  filterValue = '',
  onFilterChange,
  filterOptions = [],
  filterLabel = 'Filter',
  filterPlaceholder = 'All',
  filterMode = 'single',
  testIdPrefix = 'list-controls'
}) {
  const showFilter = filterOptions.length > 0 && typeof onFilterChange === 'function'
  const selectedFilterValues = Array.isArray(filterValue) ? filterValue : []
  const [isMultiFilterOpen, setIsMultiFilterOpen] = useState(false)
  const multiFilterRef = useRef(null)

  useEffect(() => {
    if (filterMode !== 'multiple' || !isMultiFilterOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!multiFilterRef.current?.contains(event.target)) {
        setIsMultiFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [filterMode, isMultiFilterOpen])

  const handleMultiFilterToggle = (optionValue) => {
    if (selectedFilterValues.includes(optionValue)) {
      onFilterChange(selectedFilterValues.filter((value) => value !== optionValue))
      return
    }

    onFilterChange([...selectedFilterValues, optionValue])
  }

  const selectedFilterLabels = filterOptions
    .filter((option) => selectedFilterValues.includes(option.value))
    .map((option) => option.label)
  const multiFilterButtonLabel =
    selectedFilterLabels.length === 0
      ? filterPlaceholder
      : `${selectedFilterLabels.length} warehouse${
          selectedFilterLabels.length === 1 ? '' : 's'
        } selected`

  return (
    <div className="list-controls" data-testid={`${testIdPrefix}`}>
      <label className="list-control-field">
        <span className="list-control-label">Search</span>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="list-control-input"
          data-testid={`${testIdPrefix}-search`}
        />
      </label>

      {showFilter && (
        <div className="list-control-field">
          <span className="list-control-label">{filterLabel}</span>
          {filterMode === 'multiple' ? (
            <div
              className="list-control-multi-filter"
              ref={multiFilterRef}
              data-testid={`${testIdPrefix}-filter`}
            >
              <button
                type="button"
                className="list-control-multi-trigger"
                onClick={() => setIsMultiFilterOpen((currentValue) => !currentValue)}
                aria-expanded={isMultiFilterOpen}
                data-testid={`${testIdPrefix}-filter-trigger`}
              >
                <span>{multiFilterButtonLabel}</span>
                <span className="list-control-multi-arrow" aria-hidden="true">
                  {isMultiFilterOpen ? '▴' : '▾'}
                </span>
              </button>

              {isMultiFilterOpen && (
                <div
                  className="list-control-multi-menu"
                  data-testid={`${testIdPrefix}-filter-menu`}
                >
                  {filterOptions.map((option) => (
                    <label
                      key={option.value}
                      className="list-control-checkbox"
                      data-testid={`${testIdPrefix}-filter-option-${option.value}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilterValues.includes(option.value)}
                        onChange={() => handleMultiFilterToggle(option.value)}
                        data-testid={`${testIdPrefix}-filter-checkbox-${option.value}`}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  {filterOptions.length === 0 && (
                    <span className="list-control-hint">{filterPlaceholder}</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <select
              value={filterValue}
              onChange={(event) => onFilterChange(event.target.value)}
              className="list-control-input"
              data-testid={`${testIdPrefix}-filter-select`}
            >
              <option value="">{filterPlaceholder}</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <label className="list-control-field">
        <span className="list-control-label">Sort</span>
        <select
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
          className="list-control-input"
          data-testid={`${testIdPrefix}-sort`}
        >
          <option value="asc">Name (A-Z)</option>
          <option value="desc">Name (Z-A)</option>
        </select>
      </label>
    </div>
  )
}

export default ListControls
