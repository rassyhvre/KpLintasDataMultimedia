import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

var LogoContext = createContext({
  logoUrl: '',
  refreshLogo: function () {}
});

export function LogoProvider({ children }) {
  var defaultLogo = process.env.PUBLIC_URL + '/logo_ldm.png';
  var [logoUrl, setLogoUrl] = useState(defaultLogo);

  var fetchLogo = useCallback(function () {
    axios.get(API_BASE_URL + '/api/pengaturan/logo')
      .then(function (res) {
        if (res.data.success && res.data.data) {
          setLogoUrl(API_BASE_URL + res.data.data.logo_url + '?t=' + Date.now());
        } else {
          setLogoUrl(defaultLogo);
        }
      })
      .catch(function () {
        setLogoUrl(defaultLogo);
      });
  }, [defaultLogo]);

  useEffect(function () {
    fetchLogo();
  }, [fetchLogo]);

  return (
    <LogoContext.Provider value={{ logoUrl: logoUrl, refreshLogo: fetchLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  return useContext(LogoContext);
}

export default LogoContext;
