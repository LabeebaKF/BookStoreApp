# TODO: Fix BookStoreApp Errors

## 1. Fix MUI Grid Deprecated Props
- [ ] Update frontend/src/components/UserProfile.jsx: Remove `item` prop and change size props to `size={{ xs: 12, sm: 6, md: 4 }}` etc.
- [ ] Update frontend/src/components/Demo.jsx: Same for Grid items.
- [ ] Update frontend/src/components/Books.jsx: Same for Grid items.
- [ ] Update frontend/src/components/Details.jsx: Same for Grid items.

## 2. Fix 404 for /user/profile
- [ ] Update frontend/src/axiosinterceptor.js: Change baseURL from 'http://localhost:5500' to 'http://localhost:3000' (assuming backend runs on 3000).

## 3. Test Changes
- [ ] Run backend and frontend, check console for no MUI warnings and no 404 for profile.
