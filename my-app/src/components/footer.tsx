  const Copyright = () => {
    const currentYear = new Date().getFullYear();
  
    return (
      <div className="copyright text-center">
        &copy; {currentYear}
      </div>
    );
  };
  
  export default Copyright;