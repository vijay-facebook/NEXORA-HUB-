const fs = require('fs');
const content = fs.readFileSync('src/components/MarketplaceHome.tsx', 'utf-8');
const replacement = `  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [dropdownResults, setDropdownResults] = useState<{ shops: any[], services: any[], areas: any[] }>({ shops: [], services: [], areas: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);`;
fs.writeFileSync('src/components/MarketplaceHome.tsx', content.replace(/  const \[searchQuery, setSearchQuery\] = useState\(''\);/, replacement));
