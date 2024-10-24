import { Breadcrumb } from "antd"
import { useLocation, Link } from 'react-router-dom';
// import { Link } from 'react-router';
export const Breadcrumbs = () => {
   const location = useLocation();
   const pathParts = location.pathname.split('/').filter(Boolean);
   const pathArr = []
   pathParts.forEach(path => {
      pathArr.push({ title: path, path: path });
   });
  
   console.log(location,'location');
   

   return <span className="breadcrumbs">
       <li><Link to={'/'}>Home</Link> {location.pathname != '/' && <span>&nbsp;&nbsp;/&nbsp;&nbsp;</span>}</li>
      <Breadcrumb itemRender={itemRender} items={pathArr} />
   </span>
}
function itemRender(currentRoute, params, items, pathArr) {
   const isLast = currentRoute?.path === items[items.length - 1]?.path;

   return <>
   {isLast ? (
      <span>{currentRoute.title}</span>
   ) : (
      <Link to={`/${pathArr.join("/")}`}>{currentRoute.title}</Link>
   )}
   </>
}