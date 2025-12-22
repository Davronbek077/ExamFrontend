import React from 'react'
import ExamLogo from "../../assets/ExamLogo.png"
import "./Navbar.css"

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="logo">
      <img src={ExamLogo} alt="" />
      <h2>OXFORD</h2>
      </div>
    </div>
  )
}

export default Navbar
