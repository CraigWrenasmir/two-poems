import {hydrateRoot} from 'react-dom/client';
import Reader from './reader';
import './globals.css';
const root=document.getElementById('root');
if(root)hydrateRoot(root,<Reader/>);
