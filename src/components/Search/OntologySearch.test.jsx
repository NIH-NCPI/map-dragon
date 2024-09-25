// Import necessary modules
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import  { BrowserRouter } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom'; // For testing navigation
import { OntologySearch } from './OntologySearch'; 

// Describe a test suite for your OntologySearch component
describe('OntologySearch', () => {
  // Define an individual test case within the suite
  it('renders"', () => {
    // Render the OntologySearch component
    render(<BrowserRouter><OntologySearch /></BrowserRouter>); 

    // Find an element
    const searchTitle = screen.getByText("Text about something...");
    expect(searchTitle).toHaveClass('text_above_search')

    // Assert that the element was found (i.e., it exists in the rendered output)
    expect(searchTitle).toBeInTheDocument(); 
  });
});