'use client'
// components/HistorialTable.js
import React, { useEffect, useState } from 'react';
import { getAllHistorial } from '../../services/historial.service';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 50;
const MAX_PAGE_NUMBERS = 30;

export default function Page() {
    const [historial, setHistorial] = useState([]);
    const [filteredHistorial, setFilteredHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        fecha: '',
        temperatura: '',
        humedad: '',
        co2: ''
    });
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllHistorial('');
                setHistorial(data.allData);
                setFilteredHistorial(data.allData);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            let filtered = historial;

            if (filters.fecha) {
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                    const filterDate = new Date(filters.fecha).toISOString().split('T')[0];
                    return itemDate === filterDate;
                });
            }
            if (filters.temperatura) {
                filtered = filtered.filter(item => item.temperatura.toString().includes(filters.temperatura));
            }
            if (filters.humedad) {
                filtered = filtered.filter(item => item.humedad.toString().includes(filters.humedad));
            }
            if (filters.co2) {
                filtered = filtered.filter(item => item.co2.toString().includes(filters.co2));
            }
            setFilteredHistorial(filtered);
            setCurrentPage(1);
        };

        applyFilters();
    }, [filters, historial]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const paginatedHistorial = filteredHistorial.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredHistorial.length / ITEMS_PER_PAGE);

    const renderPagination = () => {
        const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_NUMBERS / 2));
        const endPage = Math.min(totalPages, startPage + MAX_PAGE_NUMBERS - 1);
        const pages = [];

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>
                        {i}
                    </button>
                </li>
            );
        }

        return pages;
    };

    if (loading) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="container" style={{ marginTop: '15px' }}>
            <h1 className="text-center mb-4" style={{ color: '#162B4E'}}>Historial Climático</h1>

            <div className="mb-4">
                <form className="row g-3">
                    <div className="col-md-3">
                        <label htmlFor="fecha" className="form-label">Fecha:</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            className="form-control"
                            value={filters.fecha}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="temperatura" className="form-label">Temperatura:</label>
                        <input
                            type="number"
                            id="temperatura"
                            name="temperatura"
                            className="form-control"
                            value={filters.temperatura}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="humedad" className="form-label">Humedad:</label>
                        <input
                            type="number"
                            id="humedad"
                            name="humedad"
                            className="form-control"
                            value={filters.humedad}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="co2" className="form-label">CO2:</label>
                        <input
                            type="number"
                            id="co2"
                            name="co2"
                            className="form-control"
                            value={filters.co2}
                            onChange={handleFilterChange}
                        />
                    </div>
                </form>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>ID</th>
                            <th>Temperatura</th>
                            <th>Humedad</th>
                            <th>CO2</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedHistorial.length > 0 ? (
                            paginatedHistorial.map((item, index) => (
                                <tr key={index + 1}>
                                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td>{item.temperatura}</td>
                                    <td>{item.humedad}</td>
                                    <td>{item.co2}</td>
                                    <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No hay datos disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-center">
                <nav className="pagination-container" style={{ width: '100%'}}>
                    <ul className="pagination">
                        {currentPage > 1 && (
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    Anterior
                                </button>
                            </li>
                        )}
                        {renderPagination()}
                        {currentPage < totalPages && (
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    Siguiente
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </div>
    );
};
