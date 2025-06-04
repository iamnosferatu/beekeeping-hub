import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Pagination,
  Alert,
  Spinner,
  Row,
  Col,
  Dropdown,
  DropdownButton,
  ButtonGroup,
} from 'react-bootstrap';
import {
  BsSearch,
  BsFilter,
  BsArrowUp,
  BsArrowDown,
  BsThreeDots,
  BsCheck2Square,
  BsSquare,
} from 'react-icons/bs';

/**
 * DataTable - A flexible, reusable table component for admin interfaces
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data items to display
 * @param {Array} props.columns - Column configuration array
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.error] - Error message
 * @param {Function} [props.onErrorDismiss] - Callback to dismiss error
 * @param {number} [props.currentPage=1] - Current page number
 * @param {number} [props.totalPages=1] - Total number of pages
 * @param {Function} [props.onPageChange] - Page change callback
 * @param {string} [props.searchValue] - Search input value
 * @param {Function} [props.onSearchChange] - Search value change callback
 * @param {Function} [props.onSearch] - Search submit callback
 * @param {string} [props.searchPlaceholder='Search...'] - Search input placeholder
 * @param {Array} [props.filters] - Filter configuration array
 * @param {Function} [props.onFilterChange] - Filter change callback
 * @param {Function} [props.onReset] - Reset filters callback
 * @param {boolean} [props.hover=true] - Enable row hover
 * @param {boolean} [props.responsive=true] - Enable responsive wrapper
 * @param {string} [props.emptyMessage='No data found'] - Empty state message
 * @param {Array} [props.actions] - Row action configuration
 * @param {Function} [props.onAction] - Action callback
 * @param {boolean} [props.selectable=false] - Enable row selection
 * @param {Array} [props.selectedItems=[]] - Selected item IDs
 * @param {Function} [props.onSelectionChange] - Selection change callback
 * @param {string} [props.sortBy] - Current sort column
 * @param {string} [props.sortOrder='asc'] - Sort order (asc/desc)
 * @param {Function} [props.onSort] - Sort callback
 * @param {boolean} [props.striped=false] - Striped table rows
 * @param {string} [props.size] - Table size ('sm', 'md', 'lg')
 * @param {Object} [props.bulkActions] - Bulk action configuration
 * @param {Function} [props.onBulkAction] - Bulk action callback
 * @param {boolean} [props.showSearch=true] - Show search controls
 * @param {boolean} [props.showFilters=true] - Show filter controls
 * @param {ReactNode} [props.customHeader] - Custom header content
 * @param {ReactNode} [props.customFooter] - Custom footer content
 */
const DataTable = ({
  // Data props
  data = [],
  columns = [],
  
  // Loading/Error props
  loading = false,
  error,
  onErrorDismiss,
  
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  
  // Search props
  searchValue = '',
  onSearchChange,
  onSearch,
  searchPlaceholder = 'Search...',
  
  // Filter props
  filters = [],
  onFilterChange,
  onReset,
  
  // Table props
  hover = true,
  responsive = true,
  emptyMessage = 'No data found',
  striped = false,
  size,
  
  // Action props
  actions = [],
  onAction,
  
  // Selection props
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  
  // Sort props
  sortBy,
  sortOrder = 'asc',
  onSort,
  
  // Bulk actions
  bulkActions,
  onBulkAction,
  
  // Display controls
  showSearch = true,
  showFilters = true,
  customHeader,
  customFooter,
  
  ...tableProps
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Handle local search value change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  }, [onSearchChange]);

  // Handle search submit
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchValue);
    }
  }, [onSearch, localSearchValue]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    
    const allSelected = data.length > 0 && data.every(item => 
      selectedItems.includes(item.id)
    );
    
    if (allSelected) {
      // Deselect all items on current page
      const currentPageIds = data.map(item => item.id);
      const newSelection = selectedItems.filter(id => 
        !currentPageIds.includes(id)
      );
      onSelectionChange(newSelection);
    } else {
      // Select all items on current page
      const currentPageIds = data.map(item => item.id);
      const newSelection = [...new Set([...selectedItems, ...currentPageIds])];
      onSelectionChange(newSelection);
    }
  }, [data, selectedItems, onSelectionChange]);

  // Check if all items on current page are selected
  const allSelected = useMemo(() => {
    return data.length > 0 && data.every(item => 
      selectedItems.includes(item.id)
    );
  }, [data, selectedItems]);

  // Check if some items on current page are selected
  const someSelected = useMemo(() => {
    return data.some(item => selectedItems.includes(item.id)) && !allSelected;
  }, [data, selectedItems, allSelected]);

  // Handle sort
  const handleSort = useCallback((columnKey) => {
    if (!onSort) return;
    
    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newOrder);
  }, [sortBy, sortOrder, onSort]);

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (sortBy !== columnKey) return null;
    
    return sortOrder === 'asc' ? 
      <BsArrowUp className="ms-1" /> : 
      <BsArrowDown className="ms-1" />;
  };

  // Render cell content
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }
    
    // Handle nested properties (e.g., 'user.name')
    const keys = column.key.split('.');
    let value = item;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value || '-';
  };

  // Render actions
  const renderActions = (item) => {
    if (!actions || actions.length === 0) return null;

    // If there are many actions, use a dropdown
    if (actions.length > 3) {
      return (
        <DropdownButton
          as={ButtonGroup}
          variant="outline-secondary"
          size="sm"
          title={<BsThreeDots />}
          align="end"
        >
          {actions.map((action, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => onAction(action.key, item)}
              disabled={action.disabled?.(item)}
            >
              {action.icon && <span className="me-2">{action.icon}</span>}
              {action.label}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      );
    }

    // Otherwise, render as individual buttons
    return (
      <div className="d-flex justify-content-end gap-1">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline-secondary'}
            size="sm"
            title={action.label}
            onClick={() => onAction(action.key, item)}
            disabled={action.disabled?.(item)}
          >
            {action.icon || action.label}
          </Button>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="data-table">
      {/* Error Alert */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible={!!onErrorDismiss}
          onClose={onErrorDismiss}
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      {(showSearch || showFilters || customHeader) && (
        <Card className="mb-3">
          <Card.Body>
            {customHeader}
            
            {(showSearch || showFilters) && (
              <Form onSubmit={handleSearchSubmit}>
                <Row className="g-3">
                  {/* Search Input */}
                  {showSearch && (
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <BsSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder={searchPlaceholder}
                          value={localSearchValue}
                          onChange={handleSearchChange}
                        />
                        {onSearch && (
                          <Button type="submit" variant="primary">
                            Search
                          </Button>
                        )}
                      </InputGroup>
                    </Col>
                  )}

                  {/* Filters */}
                  {showFilters && filters.map((filter, index) => (
                    <Col key={index} md={filter.width || 3}>
                      <InputGroup>
                        {filter.icon && (
                          <InputGroup.Text>
                            {filter.icon}
                          </InputGroup.Text>
                        )}
                        <Form.Select
                          value={filter.value}
                          onChange={(e) => onFilterChange(filter.key, e.target.value)}
                        >
                          <option value="">{filter.placeholder || 'All'}</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Col>
                  ))}

                  {/* Reset Button */}
                  {showFilters && onReset && (
                    <Col md="auto">
                      <Button
                        variant="outline-secondary"
                        onClick={onReset}
                      >
                        Reset
                      </Button>
                    </Col>
                  )}
                </Row>
              </Form>
            )}

            {/* Bulk Actions */}
            {bulkActions && selectedItems.length > 0 && (
              <div className="mt-3 d-flex align-items-center gap-3">
                <span className="text-muted">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                {bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline-primary'}
                    size="sm"
                    onClick={() => onBulkAction(action.key, selectedItems)}
                  >
                    {action.icon && <span className="me-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <Card.Body className="p-0">
          <div className={responsive ? 'table-responsive' : ''}>
            <Table 
              hover={hover} 
              striped={striped}
              size={size}
              className="mb-0"
              {...tableProps}
            >
              <thead>
                <tr>
                  {/* Selection checkbox */}
                  {selectable && (
                    <th style={{ width: '40px' }}>
                      <div 
                        className="d-flex align-items-center justify-content-center cursor-pointer"
                        onClick={handleSelectAll}
                      >
                        {allSelected ? (
                          <BsCheck2Square />
                        ) : someSelected ? (
                          <div className="position-relative">
                            <BsSquare />
                            <div 
                              className="position-absolute top-50 start-50 translate-middle"
                              style={{ width: '8px', height: '8px', backgroundColor: 'currentColor' }}
                            />
                          </div>
                        ) : (
                          <BsSquare />
                        )}
                      </div>
                    </th>
                  )}

                  {/* Column headers */}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={column.className}
                      style={column.style}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    >
                      <div 
                        className={`d-flex align-items-center ${
                          column.sortable ? 'cursor-pointer user-select-none' : ''
                        }`}
                      >
                        {column.label}
                        {column.sortable && renderSortIcon(column.key)}
                      </div>
                    </th>
                  ))}

                  {/* Actions header */}
                  {actions.length > 0 && (
                    <th className="text-end">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item, rowIndex) => (
                    <tr key={item.id || rowIndex}>
                      {/* Selection checkbox */}
                      {selectable && (
                        <td>
                          <div 
                            className="d-flex align-items-center justify-content-center cursor-pointer"
                            onClick={() => {
                              const isSelected = selectedItems.includes(item.id);
                              if (isSelected) {
                                onSelectionChange(
                                  selectedItems.filter(id => id !== item.id)
                                );
                              } else {
                                onSelectionChange([...selectedItems, item.id]);
                              }
                            }}
                          >
                            {selectedItems.includes(item.id) ? (
                              <BsCheck2Square />
                            ) : (
                              <BsSquare />
                            )}
                          </div>
                        </td>
                      )}

                      {/* Data cells */}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={column.cellClassName}
                          style={column.cellStyle}
                        >
                          {renderCell(item, column)}
                        </td>
                      ))}

                      {/* Actions cell */}
                      {actions.length > 0 && (
                        <td>
                          {renderActions(item)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan={
                        columns.length + 
                        (selectable ? 1 : 0) + 
                        (actions.length > 0 ? 1 : 0)
                      } 
                      className="text-center py-4"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer>
            <Pagination className="mb-0 justify-content-center">
              <Pagination.First
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {/* Page numbers with ellipsis for large page counts */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                const halfVisible = Math.floor(maxVisible / 2);
                
                let start = Math.max(1, currentPage - halfVisible);
                let end = Math.min(totalPages, currentPage + halfVisible);
                
                // Adjust start/end to always show maxVisible pages if possible
                if (end - start + 1 < maxVisible) {
                  if (start === 1) {
                    end = Math.min(totalPages, start + maxVisible - 1);
                  } else {
                    start = Math.max(1, end - maxVisible + 1);
                  }
                }

                // First page
                if (start > 1) {
                  pages.push(
                    <Pagination.Item key={1} onClick={() => onPageChange(1)}>
                      1
                    </Pagination.Item>
                  );
                  if (start > 2) {
                    pages.push(<Pagination.Ellipsis key="ellipsis-start" />);
                  }
                }

                // Page range
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Pagination.Item
                      key={i}
                      active={currentPage === i}
                      onClick={() => onPageChange(i)}
                    >
                      {i}
                    </Pagination.Item>
                  );
                }

                // Last page
                if (end < totalPages) {
                  if (end < totalPages - 1) {
                    pages.push(<Pagination.Ellipsis key="ellipsis-end" />);
                  }
                  pages.push(
                    <Pagination.Item 
                      key={totalPages} 
                      onClick={() => onPageChange(totalPages)}
                    >
                      {totalPages}
                    </Pagination.Item>
                  );
                }

                return pages;
              })()}

              <Pagination.Next
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Footer>
        )}

        {/* Custom Footer */}
        {customFooter && (
          <Card.Footer>
            {customFooter}
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default DataTable;