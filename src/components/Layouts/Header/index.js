import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { HashLink as Link } from 'react-router-hash-link';
import { Box, Button, useMediaQuery, IconButton, Drawer, List, ListItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { WalletModalButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { shortenAddress, calculateStep } from '../../../utils/helper';
import CustomMenuItem from './CustomMenuItem';
import MobileMenuItem from './MobileMenuItem';
import { Provider, Program } from '@project-serum/anchor';
import { useDispatch } from 'react-redux';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import clsx from 'clsx';
import CloseIcon from '@mui/icons-material/Close';
import { MarketPlaceImage, FaqImage } from '../../Common/Arrow';
import Logo from '../../../assets/logo.png';
import { KanonProgramAdapter } from 'kanon-marketplace-sdk';
import { KanonAuctionHouseAdapter } from 'kanon-auctionhouse-sdk';
import {
  setProvider,
  getmintablenfts,
  setWallet,
  setLoading,
  setreadyflag,
  setKNProgram,
  setAHProgram,
  setReduxAhIdl,
  setStakeProvider,
  setStakeProgram
} from '../../../redux/ducks/main';
import ColorModeContext from '../../Common/ColorModeContext';
import { setSchedule } from '../../../redux/ducks/main';
import usePageTracking from 'hooks/usePageTracking';
import DarafarmJson from '../../../contracts/Contract.json'

const { REACT_APP_PUBLIC_NETWORK, REACT_APP_ENDPOINT, REACT_APP_STAKE_NETWORK, REACT_APP_STAKE_PROGRAMID } = process.env;
const opts = {
  preflightCommitment: 'processed'
};
const connection = new Connection(REACT_APP_ENDPOINT, opts.preflightCommitment);

function Header(props) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const homeMenuTitles = [
    { title: 'Home', link: '/' },
    { title: 'Marketplace', link: '/marketplace' },
    { title: 'FAQ', link: '/faq' }
  ];
  const menuTitles = [
    { title: 'Home', link: '/' },
    { title: 'Marketplace', link: '/marketplace' },
    { title: 'FAQ', link: '/faq' }
  ];

  const walletImage = <MarketPlaceImage />;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [, setAnchorEl] = useState(null);
  const [runflag, setRunflag] = useState(false);
  const location = useLocation();
  const isXs = useMediaQuery('(min-width: 900px)');
  const isXs1 = useMediaQuery('(min-width: 600px)');
  const [state, setState] = useState(false);
  const wallet = useWallet();
  const [step, setStep] = useState(0);
  const [KNProgram, setProgram] = useState(null);
  const [, setProgramAH] = useState(null);
  const [, setAhIdl] = useState(null);
  const [showNavBackground, toggleNavBackground] = useState(false);

  usePageTracking();

  const handleScroll = () => {
    if (location.pathname == '/mint') {
      toggleNavBackground(true);
    } else {
      if (window.pageYOffset > 10) {
        if (!showNavBackground) toggleNavBackground(true);
      } else {
        if (showNavBackground) toggleNavBackground(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener(`scroll`, handleScroll);
    return () => window.removeEventListener(`scroll`, handleScroll);
  });

  const getProvider = async () => {
    const prov = new Provider(connection, wallet, {
      preflightCommitment: 'confirmed'
    });

    const prog = new KanonProgramAdapter(prov, {
      isDevNet: REACT_APP_PUBLIC_NETWORK == 'devnet'
    });

    await prog.refreshByWallet();
    setProgram(prog);

    const ahProgram = new KanonAuctionHouseAdapter(prov, {
      isAuctionHouseAuthority: false,
      auctionHouseKeyString: process.env.REACT_APP_AUCTIONHOUSE_KEY,
      isCustomAuctionHouse: process.env.REACT_APP_ISCUSTOMAUCTIONHOUSE === 'true'
    });
    await ahProgram.refreshByWallet();

    setProgramAH(ahProgram);

    const ah_idl = await ahProgram.getAuctionHouseIDL();
    setAhIdl(ah_idl);
    dispatch(setReduxAhIdl(ah_idl));

    dispatch(setKNProgram(prog));
    dispatch(setAHProgram(ahProgram));
    const network = REACT_APP_STAKE_NETWORK;
    const stakeConnection = new Connection(network, opts.preflightCommitment);
    const StakeProgramID = new PublicKey(REACT_APP_STAKE_PROGRAMID);
    const provider = new Provider(stakeConnection, wallet, opts.preflightCommitment);
    dispatch(setStakeProvider(provider));

    const programs = new Program(DarafarmJson, StakeProgramID, provider);
    dispatch(setStakeProgram(programs));
    dispatch(setWallet(wallet));
    dispatch(setProvider(prov));
    // //verification
    // let val = await prog.getCollectionAuthorityAccountPubkey();
    // console.log('collection', val.toBase58())
    dispatch(setLoading(false));
  };

  useEffect(async () => {
    window.scrollTo(0, 0);
    var interval_id = window.setInterval(() => { }, 99999);
    for (var i = 0; i < interval_id; i++) window.clearInterval(i);
    dispatch(setLoading(false));
    if (location.pathname == '/mint') {
      dispatch(await getmintablenfts());
      toggleNavBackground(true);
    } else {
      toggleNavBackground(false);
    }
  }, [location.pathname]);
  //verification
  useEffect(async () => {
    // Disable MarketPlace
    // if (location.pathname == '/marketplace') {
    //     navigate('/');
    // }
    setState(false);
    if (KNProgram != null) {
      //verification
      let steps = 0;
      const collectionState = await KNProgram.getProgram().account.collectionAccount.fetch(
        KNProgram._collection_state_account_pubkey
      );
      if (collectionState.seasonOpenedTimestamp.toNumber() == 0) {
        steps = 0;
      } else {
        steps = calculateStep(collectionState);
      }
      setStep(steps);
      dispatch(setSchedule(steps));

      // disable MarketPlace
      if (location.pathname == '/marketplace' && steps != 5) {
        navigate('/');
      }

      if (steps == 2 || steps == 3) {
        dispatch(setreadyflag(true));
      } else {
        dispatch(setreadyflag(false));
      }
    }
    if (wallet && !wallet.connecting && !wallet.connected) {
      wallet.disconnect();
    }
  }, [location.pathname, KNProgram]);

  useEffect(async () => {
    dispatch(setLoading(true));
    if (wallet && wallet.connected && !wallet.disconnecting) {
      if (!runflag) {
        getProvider();
        setRunflag(true);
      }
    } else {
      setRunflag(false);
      let wallets = { ...wallet };
      const random = anchor.web3.Keypair.generate();
      wallets.publicKey = random.publicKey;
      dispatch(setWallet(wallets));
      const prov = new Provider(connection, wallets, {
        preflightCommitment: 'confirmed'
      });
      const programs = new KanonProgramAdapter(prov, {
        isDevNet: REACT_APP_PUBLIC_NETWORK == 'devnet'
      });
      await programs.refreshByWallet();
      setProgram(programs);

      const ahProgram = new KanonAuctionHouseAdapter(prov, {
        isAuctionHouseAuthority: false,
        auctionHouseKeyString: process.env.REACT_APP_AUCTIONHOUSE_KEY,
        isCustomAuctionHouse: process.env.REACT_APP_ISCUSTOMAUCTIONHOUSE === 'true'
      });
      await ahProgram.refreshByWallet();

      setProgramAH(ahProgram);

      dispatch(setAHProgram(ahProgram));

      const ah_idl = await ahProgram.getAuctionHouseIDL();
      setAhIdl(ah_idl);
      dispatch(setReduxAhIdl(ah_idl));

      dispatch(setLoading(false));

      // if(wallet != null && !wallet.ready ) {
      //     wallet.disconnect()
      // }
    }
  }, [wallet]);

  const isKanonUI = () => {
    if (location.pathname === '/') return true;
    return false;
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const mobileMenuItems = [
    {
      label: 'Home',
      link: '/',
      image: <MarketPlaceImage />
    },
    {
      label: 'Marketplace',
      link: '/marketplace',
      image: <MarketPlaceImage />
    },
    {
      label: 'FAQ',
      link: '/faq',
      image: <FaqImage />
    }
  ];
  const mobileMenuItems1 = [
    {
      label: 'Home',
      link: '/',
      image: <MarketPlaceImage />
    },
    {
      label: 'Marketplace',
      link: '/marketplace',
      image: <MarketPlaceImage />
    },
    {
      label: 'FAQ',
      link: '/faq',
      image: <FaqImage />
    }
  ];
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState(open);
  };
  const list = () => (
    <Box sx={{ width: 'auto' }} role="presentation" className={'zindex-9999'}>
      <List className={'mobile-menu-wrp'}>
        <ListItem className={'mobile-menu-header'}>
          <Link to="/">
            <img src={Logo} alt="logo" className={'logo-img'} />
          </Link>
          <Button className={'btn-menu-close'} onClick={toggleDrawer(false)}>
            <CloseIcon />
          </Button>
        </ListItem>
        {(isKanonUI() ? mobileMenuItems : mobileMenuItems1).map((text, index) => (
          <MobileMenuItem
            title={text.label}
            image={text.image}
            key={index}
            link={text.link === '/marketplace' && step !== 5 ? '#' : text.link}
            onClose={toggleDrawer(false)}
          />
        ))}
        {wallet.publicKey != null && (
          <MobileMenuItem title="My Wallet" image={walletImage} link="/mywallet" onClose={toggleDrawer(false)} />
        )}
        {!isXs1 && (
          <ListItem className={'wallet-button-section'}>
            {wallet.publicKey == null ? (
              <WalletModalButton className="wallet-modal-button" onClick={toggleDrawer(false)}>
                Connect wallet
              </WalletModalButton>
            ) : (
              <Button className={'wallet-adapter-button is-connected'}>
                {shortenAddress(wallet.publicKey.toBase58() || '')}
              </Button>
            )}
          </ListItem>
        )}
        {wallet.publicKey != null && !isXs1 && (
          <ListItem className={'wallet-button-section'} sx={{ marginTop: '10px !important' }}>
            <Button
              className={'wallet-adapter-button is-connected'}
              onClick={() => {
                wallet.disconnect();
                toggleDrawer(false);
              }}
            >
              Disconnect
            </Button>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box className={clsx('mp-nav', showNavBackground ? ' is-filled' : '')}>
      <Link to="/">
        <Box className="logo">
          <img src={Logo} alt="logo" className="logo-img" />
        </Box>
      </Link>

      <Box className={'header-menu'}>
        {isXs &&
          (isKanonUI() ? homeMenuTitles : menuTitles).map((val, index) => (
            <CustomMenuItem title={val.title} key={index} link={val.link} step={step} />
          ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box className={'header-right-menu'}>
          {/* {isXs && <ListItem button className={classes.darkButton}><DarkImage /></ListItem>} */}
          {wallet.publicKey != null && isXs && <CustomMenuItem title={'My Wallet'} link="/mywallet" step={step} />}
          {isXs1 && (
            <Box>
              <WalletMultiButton></WalletMultiButton>
            </Box>
          )}
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <React.Fragment key="top">
            <IconButton className={'mobile-menu-button'} aria-label="Menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor={'right'} open={state} onClose={toggleDrawer(false)} className={'right-menu-drawer'}>
              {list()}
            </Drawer>
          </React.Fragment>
        </Box>
      </Box>
    </Box>
  );
}

export default Header;

