import {createRoot,hydrateRoot} from 'react-dom/client';
import Reader from './reader';
import './globals.css';
const root=document.getElementById('root');
if(root){
 if(root.firstElementChild)hydrateRoot(root,<Reader/>);
 else createRoot(root).render(<Reader/>);
}
