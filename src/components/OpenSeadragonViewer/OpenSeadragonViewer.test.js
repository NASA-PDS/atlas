import React from 'react'
import { render, test, expect } from '@testing-library/react'
import Navbar from './Navbar'

test('renders learn react link', () => {
    const { getByText } = render(<Navbar />)
    const linkElement = getByText(/learn react/i)
    expect(linkElement).toBeInTheDocument()
})
