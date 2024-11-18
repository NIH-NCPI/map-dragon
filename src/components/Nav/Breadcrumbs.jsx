import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { useEffect, useContext, useState, useMemo } from 'react';
import { getById } from '../Manager/FetchManager';
import { myContext } from '../../App';

export const Breadcrumbs = () => {
  const { vocabUrl } = useContext(myContext);
  const location = useLocation();

  // Memoize path parts to avoid unnecessary recalculations
  const pathParts = useMemo(() => location.pathname.split('/').filter(Boolean), [location.pathname]);
  const [updatedPathArr, setUpdatedPathArr] = useState([]);

  useEffect(() => {
    const controller = new AbortController(); // For canceling stale requests

    const fetchBreadcrumbData = async () => {
      const pathArr = pathParts.map((path) => ({ title: path, path: path }));

      try {
        const promises = [];
        for (let i = 0; i < pathArr.length; i += 2) {
          if (i + 1 < pathArr.length) {
            promises.push(
              getById(vocabUrl, pathArr[i].path, pathArr[i + 1].path, { signal: controller.signal }).then((result) => {
                pathArr[i + 1] = { ...pathArr[i + 1], title: result.name };
              })
            );
          }
        }

        await Promise.all(promises); // Wait for all `getById` calls to finish
        setUpdatedPathArr([...pathArr]);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request aborted:', error); // Ignore aborted fetches
        } else {
          console.error('Fetch error:', error);
        }
      }
    };

    fetchBreadcrumbData();

    return () => {
      controller.abort(); // Cleanup stale requests
    };
  }, [vocabUrl, pathParts]); // Dependencies: vocabUrl and pathParts

  if (!updatedPathArr.length) {
    return null; // Show nothing until breadcrumbs are loaded
  }

  return (
    <span className="breadcrumbs">
      <li>
        <Link to="/">Home</Link>{' '}
        {location.pathname !== '/' && <span>&nbsp;&nbsp;/&nbsp;&nbsp;</span>}
      </li>
      <Breadcrumb itemRender={(route, params, items) => itemRender(route, params, items)} items={updatedPathArr} />
    </span>
  );
};

function itemRender(currentRoute, params, items) {
  const isLast = currentRoute?.path === items[items.length - 1]?.path;

  // Build cumulative path
  const cumulativePath = items
    .slice(0, items.findIndex((item) => item.path === currentRoute.path) + 1)
    .map((item) => item.path)
    .join('/');

  return isLast ? (
    <span>{currentRoute.title}</span>
  ) : (
    <Link to={`/${cumulativePath}`}>{currentRoute.title}</Link>
  );
}
