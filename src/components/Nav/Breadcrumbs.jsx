import { Breadcrumb } from "antd"
import { useLocation } from 'react-router-dom';
export const Breadcrumbs = () => {
   const location = useLocation();
   const pathParts = location.pathname.split('/').filter(Boolean);
   const pathArr = []
   pathParts.forEach(path => {
      pathArr.push({title:path});
   });
   return <span className="breadcrumbs">
      <Breadcrumb
         items={pathArr}
         params={{ id: 1 }}
      />
   </span>
}