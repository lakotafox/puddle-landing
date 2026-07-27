'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeStatus,
  EmployeeUpdateRequest,
  PayType,
  WalletBalance,
} from '@/lib/types';
import styles from '@/styles/Company.module.css';

const STATUSES: EmployeeStatus[] = ['active', 'inactive', 'on_leave', 'terminated'];

const ASSIGNABLE_ROLES = ['Employee', 'HR', 'Manager', 'Payroll', 'Admin'];

const EMPTY_FORM: EmployeeCreateRequest = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  hire_date: '',
  role_names: ['Employee'],
  password: '',
};

function shortAddr(addr: string | null): string {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Which card(s) to render: sidebar gives each its own section. */
export type CompanySection = 'info' | 'add' | 'manage';

export default function CompanyDashboard({
  section,
}: {
  /** Omit to render all three cards (legacy single-page layout). */
  section?: CompanySection;
}) {
  const { me } = useAuth();
  const employer = me?.employer;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<EmployeeCreateRequest>(EMPTY_FORM);
  const [payType, setPayType] = useState<PayType>('salary');
  const [payRate, setPayRate] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Inline edit modal state.
  const [editing, setEditing] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EmployeeUpdateRequest & { pay_rate_str: string }>({
    pay_rate_str: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = (emp: Employee) => {
    setEditError(null);
    setEditing(emp);
    setEditForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone ?? '',
      hire_date: emp.hire_date ?? '',
      status: emp.status,
      pay_type: emp.pay_type ?? 'salary',
      pay_rate_str: emp.pay_rate ?? '',
    });
  };

  const editField = (field: keyof (EmployeeUpdateRequest & { pay_rate_str: string })) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const payload: EmployeeUpdateRequest = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone?.trim() ? editForm.phone : undefined,
        hire_date: editForm.hire_date || undefined,
        status: editForm.status,
        pay_type: editForm.pay_rate_str ? editForm.pay_type : undefined,
        pay_rate: editForm.pay_rate_str ? parseFloat(editForm.pay_rate_str) : undefined,
      };
      await apiClient.updateEmployee(editing.id, payload);
      setEditing(null);
      await loadData();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setSavingEdit(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const [emps, bal] = await Promise.all([
        apiClient.listEmployees(),
        apiClient.getWalletBalance().catch(() => null),
      ]);
      setEmployees(emps);
      setBalance(bal);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const update = (field: keyof EmployeeCreateRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleRole = (role: string) =>
    setForm((prev) => {
      const roles = prev.role_names ?? [];
      return {
        ...prev,
        role_names: roles.includes(role)
          ? roles.filter((r) => r !== role)
          : [...roles, role],
      };
    });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    setAdding(true);
    try {
      // Strip empty optional fields so the backend keeps them null.
      const payload: EmployeeCreateRequest = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        hire_date: form.hire_date || undefined,
        role_names: form.role_names?.length ? form.role_names : ['Employee'],
        password: form.password?.trim() || undefined,
        pay_type: payRate ? payType : undefined,
        pay_rate: payRate ? parseFloat(payRate) : undefined,
      };
      const created = await apiClient.createEmployee(payload);
      setAddSuccess(
        `Added ${created.first_name} ${created.last_name} — wallet ${shortAddr(
          created.wallet_address
        )} funded with a USDC trustline.`
      );
      setForm(EMPTY_FORM);
      setPayRate('');
      await loadData();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Remove ${emp.first_name} ${emp.last_name}? This cannot be undone.`)) {
      return;
    }
    try {
      await apiClient.deleteEmployee(emp.id);
      await loadData();
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete employee');
    }
  };

  const show = (s: CompanySection) => !section || section === s;

  return (
    <div className={styles.container}>
      {/* Company information */}
      {show('info') && (
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Company Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Company</span>
            <span className={styles.infoValue}>{employer?.company_name ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{employer?.email ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{employer?.phone || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Address</span>
            <span className={styles.infoValue}>{employer?.address || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Employees</span>
            <span className={styles.infoValue}>{employees.length}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Company USDC</span>
            <span className={styles.infoValue}>
              {balance ? `${balance.usdc_balance.toFixed(2)} USDC` : '—'}
            </span>
          </div>
        </div>
      </section>
      )}

      {/* Add employee */}
      {show('add') && (
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Add Employee</h3>
        <p className={styles.hint}>
          A Stellar wallet is created for each new employee and funded from your
          company wallet, with a USDC trustline set up automatically.
        </p>
        <form className={styles.form} onSubmit={handleAdd}>
          {addError && <div className={styles.error}>{addError}</div>}
          {addSuccess && <div className={styles.success}>{addSuccess}</div>}

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>First name</label>
              <input
                className={styles.input}
                required
                value={form.first_name}
                onChange={update('first_name')}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name</label>
              <input
                className={styles.input}
                required
                value={form.last_name}
                onChange={update('last_name')}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                required
                value={form.email}
                onChange={update('email')}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input
                className={styles.input}
                value={form.phone ?? ''}
                onChange={update('phone')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Hire date</label>
              <input
                className={styles.input}
                type="date"
                value={form.hire_date ?? ''}
                onChange={update('hire_date')}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password (optional login)</label>
              <input
                className={styles.input}
                type="password"
                autoComplete="new-password"
                value={form.password ?? ''}
                onChange={update('password')}
                placeholder="Leave blank for no login"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Pay type</label>
              <select
                className={styles.input}
                value={payType}
                onChange={(e) => setPayType(e.target.value as PayType)}
              >
                <option value="salary">Salary (per year)</option>
                <option value="hourly">Hourly (per hour)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                {payType === 'salary' ? 'Annual salary (USDC)' : 'Hourly rate (USDC)'}
              </label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={payRate}
                onChange={(e) => setPayRate(e.target.value)}
                placeholder={payType === 'salary' ? '50000' : '24.04'}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Roles</label>
            <div className={styles.roleRow}>
              {ASSIGNABLE_ROLES.map((role) => (
                <label key={role} className={styles.roleChip}>
                  <input
                    type="checkbox"
                    checked={form.role_names?.includes(role) ?? false}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <button className={styles.button} type="submit" disabled={adding}>
            {adding ? 'Adding & funding wallet…' : 'Add employee'}
          </button>
        </form>
      </section>
      )}

      {/* Manage employees */}
      {show('manage') && (
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Manage Employees</h3>
        {listError && <div className={styles.error}>{listError}</div>}
        {loading ? (
          <p>Loading employees…</p>
        ) : employees.length === 0 ? (
          <p className={styles.hint}>No employees yet. Add your first one above.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Wallet</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.roles.map((r) => r.name).join(', ') || '—'}</td>
                    <td>{emp.status}</td>
                    <td title={emp.wallet_address ?? ''}>{shortAddr(emp.wallet_address)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => startEdit(emp)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(emp)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {/* Edit employee modal */}
      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.cardTitle}>
              Edit {editing.first_name} {editing.last_name}
            </h3>
            <form className={styles.form} onSubmit={saveEdit}>
              {editError && <div className={styles.error}>{editError}</div>}

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>First name</label>
                  <input
                    className={styles.input}
                    required
                    value={editForm.first_name ?? ''}
                    onChange={editField('first_name')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last name</label>
                  <input
                    className={styles.input}
                    required
                    value={editForm.last_name ?? ''}
                    onChange={editField('last_name')}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    required
                    value={editForm.email ?? ''}
                    onChange={editField('email')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone</label>
                  <input
                    className={styles.input}
                    value={editForm.phone ?? ''}
                    onChange={editField('phone')}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Hire date</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={editForm.hire_date ?? ''}
                    onChange={editField('hire_date')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.input}
                    value={editForm.status ?? 'active'}
                    onChange={editField('status')}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Pay type</label>
                  <select
                    className={styles.input}
                    value={editForm.pay_type ?? 'salary'}
                    onChange={editField('pay_type')}
                  >
                    <option value="salary">Salary (per year)</option>
                    <option value="hourly">Hourly (per hour)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {editForm.pay_type === 'hourly' ? 'Hourly rate (USDC)' : 'Annual salary (USDC)'}
                  </label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.pay_rate_str}
                    onChange={editField('pay_rate_str')}
                    placeholder="Leave blank to keep unset"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.pauseButton}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button className={styles.button} type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
