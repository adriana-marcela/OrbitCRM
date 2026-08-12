import { NavItem } from './nav-item/nav-item';

/**
 * Array de objetos que representan los items del menú lateral
 */
export const navItems: NavItem[] = [
	{
		displayName: 'Inicio',
		iconName: 'dashboard',
		route: '/inicio',
	},
	{
		displayName: 'Clientes',
		iconName: 'person',
		route: '/clientes',
	},
	{
		displayName: 'Colaboradores',
		iconName: 'handshake',
		route: '/colaboradores',
	},
	{
		displayName: 'Servicios',
		iconName: 'list',
		route: '/servicios',
	},
	{
		displayName: 'Chat',
		iconName: 'message',
		route: '/chat',
		// badge: 5
	},
];

