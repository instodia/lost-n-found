import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { Hero } from './components/home/Hero';
import { StatsSection } from './components/home/StatsSection';
import { CategoryGrid } from './components/home/CategoryGrid';
import { RecentItemsSection } from './components/home/RecentItemsSection';
import { HowItWorks } from './components/home/HowItWorks';
import { BrowseItemsView } from './components/browse/BrowseItemsView';
import { ReportItemForm } from './components/report/ReportItemForm';
import { ItemDetailView } from './components/details/ItemDetailView';
import { UserDashboardView } from './components/dashboard/UserDashboardView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { ClaimModal } from './components/claim/ClaimModal';
import { SmartMatchModal } from './components/claim/SmartMatchModal';
import {
  getStoredItems,
  getStoredItemById,
  saveItem,
  updateItem,
  deleteItem,
  getStoredClaims,
  createClaim,
  updateClaimStatus,
  getActivityLogs,
} from './services/storage';
import { ITEM_TYPES } from './types';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const { addToast } = useToast();

  // Navigation and view state
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'browse' | 'report' | 'details' | 'dashboard' | 'admin'
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [reportInitialType, setReportInitialType] = useState(ITEM_TYPES.LOST);
  const [browseFilter, setBrowseFilter] = useState({});

  // Data state
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [claimModalItem, setClaimModalItem] = useState(null);
  const [activeMatchData, setActiveMatchData] = useState(null); // { targetItem, match }

  // Ensure pure light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('findit_theme');
  }, []);

  // Load initial data
  const refreshData = async () => {
    try {
      const [storedItems, storedClaims, storedLogs] = await Promise.all([
        getStoredItems(),
        getStoredClaims(),
        getActivityLogs(),
      ]);
      setItems(storedItems);
      setClaims(storedClaims);
      setActivityLogs(storedLogs);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Safety guard: Ensure loading spinner never hangs more than 2 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Navigation helpers
  const handleViewDetails = (itemId) => {
    setSelectedItemId(itemId);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (type = ITEM_TYPES.LOST) => {
    if (!currentUser) {
      addToast({
        title: 'Sign In Required',
        message: 'Please sign in with your User ID (e.g. user1 or admin1) to report an item.',
        type: 'info',
      });
      setAuthModalOpen(true);
      return;
    }
    setReportInitialType(type);
    setCurrentView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (filter) => {
    setBrowseFilter(filter);
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId) => {
    setBrowseFilter({ category: catId });
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Item Actions
  const handleCreateItem = async (itemData) => {
    const created = await saveItem(itemData, currentUser);
    await refreshData();
    setSelectedItemId(created.id);
    setCurrentView('details');
  };

  const handleUpdateItem = async (itemId, patchData) => {
    await updateItem(itemId, patchData, currentUser);
    await refreshData();
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteItem(itemId, currentUser);
      addToast({ title: 'Listing Deleted', message: 'The item has been removed from FindIt', type: 'info' });
      await refreshData();
      if (currentView === 'details') setCurrentView('browse');
    }
  };

  const handleMarkRecovered = async (itemId) => {
    await updateItem(itemId, { status: 'RESOLVED' }, currentUser);
    addToast({
      title: 'Item Marked as Returned! 🎉',
      message: 'Congratulations on reuniting with your belonging.',
      type: 'success',
    });
    await refreshData();
  };

  // Claim Actions
  const handleSubmitClaim = async (claimData) => {
    await createClaim(claimData, currentUser);
    addToast({
      title: 'Claim Submitted Successfully',
      message: 'The reporter has received your ownership proof and will review it shortly.',
      type: 'success',
    });
    await refreshData();
  };

  const handleReviewClaim = async (claimId, status, notes) => {
    await updateClaimStatus(claimId, status, notes, currentUser);
    addToast({
      title: `Claim ${status === 'APPROVED' ? 'Approved! 🎉' : 'Rejected'}`,
      message: `The claim has been updated to ${status.toLowerCase()}`,
      type: status === 'APPROVED' ? 'success' : 'info',
    });
    await refreshData();
  };

  // Smart Match Modal
  const handleOpenMatchModal = (match, targetItem = null) => {
    const currentItem = targetItem || items.find((i) => i.id === selectedItemId);
    setActiveMatchData({
      targetItem: currentItem,
      match,
    });
  };

  // Selected item object for details view
  const currentItemObject = items.find((i) => i.id === selectedItemId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'browse') setBrowseFilter({});
          setCurrentView(view);
        }}
        openAuthModal={() => setAuthModalOpen(true)}
        onQuickSearch={handleSearchSubmit}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Connecting to FindIt Hub...</p>
          </div>
        ) : (
          <>
            {/* HOME VIEW */}
            {currentView === 'home' && (
              <>
                <Hero onReportClick={handleOpenReport} onSearchSubmit={handleSearchSubmit} />
                <StatsSection items={items} />
                <CategoryGrid items={items} onSelectCategory={handleSelectCategory} />
                <RecentItemsSection
                  items={items}
                  onViewDetails={handleViewDetails}
                  onExploreAll={() => {
                    setBrowseFilter({});
                    setCurrentView('browse');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
                <HowItWorks onReportClick={handleOpenReport} />
              </>
            )}

            {/* BROWSE VIEW */}
            {currentView === 'browse' && (
              <BrowseItemsView
                items={items}
                initialFilter={browseFilter}
                onViewDetails={handleViewDetails}
                onReportClick={handleOpenReport}
              />
            )}

            {/* REPORT VIEW */}
            {currentView === 'report' && (
              <ReportItemForm
                initialType={reportInitialType}
                onSubmitSuccess={handleCreateItem}
                onCancel={() => setCurrentView('browse')}
              />
            )}

            {/* ITEM DETAILS VIEW */}
            {currentView === 'details' && currentItemObject && (
              <ItemDetailView
                item={currentItemObject}
                allItems={items}
                onBack={() => setCurrentView('browse')}
                onOpenClaimModal={(itemToClaim) => {
                  if (!currentUser) {
                    addToast({
                      title: 'Sign In Required',
                      message: 'Please sign in to submit an ownership claim.',
                      type: 'info',
                    });
                    setAuthModalOpen(true);
                    return;
                  }
                  setClaimModalItem(itemToClaim);
                }}
                onOpenMatchModal={handleOpenMatchModal}
                onMarkRecovered={handleMarkRecovered}
                onViewItem={handleViewDetails}
              />
            )}

            {/* USER DASHBOARD VIEW */}
            {currentView === 'dashboard' && (
              <UserDashboardView
                items={items}
                claims={claims}
                onViewItem={handleViewDetails}
                onReportClick={handleOpenReport}
                onDeleteItem={handleDeleteItem}
                onMarkRecovered={handleMarkRecovered}
                onReviewClaim={handleReviewClaim}
                onOpenMatchModal={handleOpenMatchModal}
              />
            )}

            {/* ADMIN PORTAL VIEW */}
            {currentView === 'admin' && (
              <AdminDashboardView
                items={items}
                claims={claims}
                activityLogs={activityLogs}
                onViewItem={handleViewDetails}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
                onReviewClaim={handleReviewClaim}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          if (view === 'report') handleOpenReport('LOST');
          else {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Authentication & Persona Switcher Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Ownership Claim Modal */}
      <ClaimModal
        isOpen={Boolean(claimModalItem)}
        onClose={() => setClaimModalItem(null)}
        item={claimModalItem}
        onSubmitClaim={handleSubmitClaim}
      />

      {/* Smart Match Side-by-Side Modal */}
      {activeMatchData && (
        <SmartMatchModal
          isOpen={Boolean(activeMatchData)}
          onClose={() => setActiveMatchData(null)}
          targetItem={activeMatchData.targetItem}
          match={activeMatchData.match}
          onClaimCandidate={(candidate) => setClaimModalItem(candidate)}
          onViewCandidate={handleViewDetails}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
