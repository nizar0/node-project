export const MENU_ITEMS = {
  admin: [

    { name: 'Dashboard', route: '/dashboard/admin' },
    { name: 'Gestion des utilisateurs', route: '/dashboard/admin/users' },
    { name: 'Gestion des Yachts', route: '/dashboard/admin/yachts' },
    { name: 'Gestion des Reviews', route: '/dashboard/admin/reviews' },
    { name: 'Paramètres', route: '/dashboard/admin/settings' },
  ],
  owner: [
    { name: 'Mes Yachts', route: '/dashboard/owner/list' },
    { name: 'Mon Agenda', route: '/dashboard/owner/bookings' },
    { name: 'Mes Revenus', route: '/dashboard/owner/earnings' },
    { name: 'Ajouter un Yacht', route: '/dashboard/owner/yacht/add' },
    { name: 'Paramètres', route: '/dashboard/owner/settings' },

  ],

  client: [
    { name: 'Liste yachts Disponible', route: '/dashboard/client/list' },
    { name: 'Mes réservations', route: '/dashboard/client/bookings' },
    { name: 'Mes payments', route: '/dashboard/client/payments' },
    { name: 'Paramètres', route: '/dashboard/client/settings' },
  ],
};
