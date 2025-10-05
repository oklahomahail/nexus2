import { useEffect, useState } from "react";
import { ChevronDown, Filter, Grid, List, Plus, Upload } from "lucide-react";

import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Badge from "@/components/ui/Badge";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TableSkeletonRow,
  TableEmpty
} from "@/components/ui/Table";
import ClientModal from "@/components/ClientModal";
import ConfirmModal from "@/components/ui-kit/ConfirmModal";
import { listClients, deleteClient, Client } from "@/services/clientService";

type ClientStatus = 'Active' | 'Prospect' | 'Inactive';
type ViewMode = 'table' | 'grid';

// Mock data for demonstration
const mockFilters = {
  owners: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Anderson'],
  segments: ['Small Business', 'Enterprise', 'Nonprofit', 'Government'],
};

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Client modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await listClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const handleNewClient = () => {
    setModalMode("create");
    setSelectedClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setModalMode("edit");
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClientClick = (client: Client) => {
    setClientToDelete(client);
    setShowConfirmModal(true);
  };

  const confirmDeleteClient = async () => {
    if (clientToDelete) {
      const success = await deleteClient(clientToDelete.id);
      if (success) {
        await loadClients();
      } else {
        alert("Failed to delete client.");
      }
    }
    setShowConfirmModal(false);
    setClientToDelete(null);
  };

  const cancelDeleteClient = () => {
    setShowConfirmModal(false);
    setClientToDelete(null);
  };

  const handleClientSaved = async () => {
    setShowClientModal(false);
    setSelectedClient(null);
    await loadClients();
  };

  const handleSelectClient = (clientId: string, selected: boolean) => {
    setSelectedClients(prev => 
      selected 
        ? [...prev, clientId]
        : prev.filter(id => id !== clientId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedClients(selected ? clients.map(c => c.id) : []);
  };

  const getClientStatus = (client: Client): ClientStatus => {
    // Mock status logic - in real app this would come from the client data
    return Math.random() > 0.7 ? 'Prospect' : Math.random() > 0.3 ? 'Active' : 'Inactive';
  };

  const getStatusBadgeVariant = (status: ClientStatus) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Prospect': return 'info';
      case 'Inactive': return 'default';
      default: return 'default';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.shortName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || getClientStatus(client) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const hasAnyClients = clients.length > 0;
  const hasFilteredResults = filteredClients.length > 0;

  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Header Bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-panel">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h3 text-text">Clients</h1>
            <p className="text-body-sm text-muted mt-1">Organizations you manage</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="w-64">
              <SearchInput
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {/* View Toggle */}
            <div className="flex items-center bg-elevated rounded-lg border border-border">
              <button
                type="button"
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-accent text-white' 
                    : 'text-muted hover:text-text'
                }`}
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-accent text-white' 
                    : 'text-muted hover:text-text'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
            
            {/* Import Dropdown */}
            <div className="relative">
              <Button variant="secondary" size="md">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {/* Primary CTA */}
            <Button onClick={handleNewClient}>
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Button>
          </div>
        </div>
        
        {/* Filter Row */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-muted">Status:</span>
                <select 
                  className="bg-elevated border border-border rounded-lg px-3 py-1 text-body text-text"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'All')}
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="text-body-sm text-muted">
                Showing {filteredClients.length} of {clients.length} clients
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <div className="flex-shrink-0 px-6 py-3 bg-accent/10 border-b border-accent/20">
          <div className="flex items-center justify-between">
            <span className="text-body text-accent">
              {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                Assign Owner
              </Button>
              <Button variant="secondary" size="sm">
                Update Status
              </Button>
              <Button variant="secondary" size="sm">
                Start Campaign
              </Button>
              <Button variant="secondary" size="sm">
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {!hasAnyClients ? (
          // Global empty state
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="text-h4 text-text">No clients yet</div>
            <div className="text-body text-muted max-w-md text-center">
              Add your first client to get started with managing your relationships and campaigns.
            </div>
            <div className="space-y-2">
              <Button onClick={handleNewClient}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first client
              </Button>
              <div className="text-caption text-muted">
                Quick start checklist:
                <br />• Add client details • Set up contacts • Configure preferences
              </div>
            </div>
          </div>
        ) : !hasFilteredResults ? (
          // Filtered empty state
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="text-h4 text-text">No matches found</div>
            <div className="text-body text-muted">
              Try adjusting your search terms or filters.
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          // Table view
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredClients.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border bg-elevated"
                  />
                </TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Open Tasks</TableHead>
                <TableHead>Current Campaign</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeletonRow key={i} columns={9} />
                ))
              ) : (
                filteredClients.map((client) => {
                  const status = getClientStatus(client);
                  const isSelected = selectedClients.includes(client.id);
                  
                  return (
                    <TableRow key={client.id} selected={isSelected}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                          className="rounded border-border bg-elevated"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-body-sm font-medium text-accent">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-text">{client.name}</div>
                            {client.shortName && (
                              <div className="text-body-sm text-muted">{client.shortName}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted/20"></div>
                          <span className="text-muted">Unassigned</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted">2 days ago</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" size="sm">
                          3
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted">None</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted">1 week ago</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClientClick(client)}
                            className="text-error hover:bg-error/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Modals */}
      <ClientModal
        open={showClientModal}
        mode={modalMode}
        client={selectedClient}
        onClose={() => {
          setShowClientModal(false);
          setSelectedClient(null);
        }}
        onSaved={handleClientSaved}
      />
      
      <ConfirmModal
        open={showConfirmModal}
        title="Delete Client"
        message={`Are you sure you want to delete "${clientToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteClient}
        onCancel={cancelDeleteClient}
      />
    </div>
  );
}
