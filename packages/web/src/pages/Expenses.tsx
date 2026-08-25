import { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory } from '@stableos/shared';
import { getExpenses, createExpense, updateExpense, deleteExpense, getHorses } from '@stableos/shared';
import { success, error } from '../utils/toast';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/expenses.css';

interface ExpensesProps {
  farmId: string;
}

const CATEGORIES: ExpenseCategory[] = ['feed', 'veterinary', 'farrier', 'equipment', 'facility', 'training', 'transport', 'other'];

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  feed: '🌾',
  veterinary: '⚕️',
  farrier: '🔨',
  equipment: '🔧',
  facility: '🏠',
  training: '🎓',
  transport: '🚚',
  other: '📌',
};

export default function Expenses({ farmId }: ExpensesProps) {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'feed' as ExpenseCategory,
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    horse_id: '',
  });

  useEffect(() => {
    loadData();
  }, [farmId]);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [expensesData, horsesData] = await Promise.all([
        getExpenses(farmId),
        getHorses(farmId),
      ]);
      setExpenses(expensesData || []);
      setHorses(horsesData || []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('expenses.failedToLoad'));
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForm(expense?: Expense) {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description || '',
        expense_date: expense.expense_date,
        horse_id: expense.horse_id || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        amount: '',
        category: 'feed',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        horse_id: '',
      });
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      error(t('expenses.amountRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || undefined,
          expense_date: formData.expense_date,
          horse_id: formData.horse_id || undefined,
        });
        success(t('expenses.updatedSuccess'));
      } else {
        await createExpense({
          farm_id: farmId,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || undefined,
          expense_date: formData.expense_date,
          horse_id: formData.horse_id || undefined,
          currency: 'USD',
          is_active: true,
        } as any);
        success(t('expenses.createdSuccess'));
      }

      setShowForm(false);
      loadData();
    } catch (err) {
      console.error('Error saving expense:', err);
      const errorMsg = err instanceof Error ? err.message : t('expenses.failedToSave');
      setErrorMsg(errorMsg);
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(expenseId: string) {
    if (!window.confirm(t('expenses.deleteConfirm'))) {
      return;
    }

    try {
      setDeletingId(expenseId);
      await deleteExpense(expenseId);
      success(t('expenses.deletedSuccess'));
      loadData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMsg = err instanceof Error ? err.message : t('expenses.failedToDelete');
      setErrorMsg(errorMsg);
      error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(exp => exp.category === filterCategory);

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expenses-container">
      {/* Header */}
      <div className="roster-header">
        <h2>{t('expenses.title')}</h2>
        <button className="create-button" onClick={() => handleOpenForm()}>
          {t('expenses.addExpense')}
        </button>
      </div>

      {errorMsg && (
        <div className="error-message">
          {errorMsg}
          <button onClick={loadData} className="retry-button">
            {t('expenses.retry')}
          </button>
        </div>
      )}

      {loading && <div className="loading">{t('expenses.loading')}</div>}

      {!loading && (
        <>
          {/* Summary Card */}
          <div className="summary-card">
            <div className="summary-item">
              <div className="summary-label">{t('expenses.totalSpent')}</div>
              <div className="summary-value">${totalAmount.toFixed(2)}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">{t('expenses.expenseCount')}</div>
              <div className="summary-value">{filteredExpenses.length}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">{t('expenses.averageExpense')}</div>
              <div className="summary-value">
                ${filteredExpenses.length > 0 ? (totalAmount / filteredExpenses.length).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingExpense ? t('expenses.editExpense') : t('expenses.addExpense')}</h3>
                  <button className="close-button" onClick={() => setShowForm(false)}>
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                  <div className="form-group">
                    <label>{t('expenses.amount')} {t('expenses.required')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('expenses.category')}</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {t(`expenses.${cat}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('expenses.date')}</label>
                    <input
                      type="date"
                      value={formData.expense_date}
                      onChange={e => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('expenses.horse')}</label>
                    <select
                      value={formData.horse_id}
                      onChange={e => setFormData(prev => ({ ...prev, horse_id: e.target.value }))}
                    >
                      <option value="">{t('expenses.noHorse')}</option>
                      {horses.map(horse => (
                        <option key={horse.id} value={horse.id}>
                          {horse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('expenses.description')}</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('expenses.descriptionPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={() => setShowForm(false)} disabled={submitting}>
                      {t('expenses.cancel')}
                    </button>
                    <button type="submit" className="submit-button" disabled={submitting}>
                      {submitting ? `⏳ ${t('expenses.saving')}` : editingExpense ? t('expenses.update') : t('expenses.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="category-filter">
            <button
              className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              {t('expenses.all')}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {CATEGORY_ICONS[cat]}
              </button>
            ))}
          </div>

          {/* Expenses List */}
          {filteredExpenses.length > 0 ? (
            <div className="expenses-list">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-icon">{CATEGORY_ICONS[expense.category]}</div>
                  <div className="expense-content">
                    <div className="expense-category">{t(`expenses.${expense.category}`)}</div>
                    {expense.description && <div className="expense-description">{expense.description}</div>}
                    <div className="expense-date">{expense.expense_date}</div>
                  </div>
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  <div className="expense-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleOpenForm(expense)}
                      disabled={deletingId === expense.id}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId !== null}
                      title="Delete"
                    >
                      {deletingId === expense.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <div className="empty-text">
                {filterCategory === 'all' ? t('expenses.noExpenses') : t('expenses.noExpensesCategory')}
              </div>
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="refresh-button-container">
        <button onClick={loadData} className="refresh-button">
          🔄 {t('expenses.refresh')}
        </button>
      </div>
    </div>
  );
}
