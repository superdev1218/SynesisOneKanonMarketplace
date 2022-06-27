import React, { useEffect, useMemo, useState } from 'react';
import {
  InputAdornment,
  Grid,
  Box,
  Typography,
  IconButton,
  Input,
  CircularProgress,
  Select,
  MenuItem,
  Container,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import { SearchIcon } from '../../components/Common/Arrow';
import ClearIcon from '@mui/icons-material/Clear';
import { useSelector } from 'react-redux';
import DetailModal from '../Marketplace/Detail';
import { MarketplacePgSize, CallTime, ahgetlistednfts, ahgetlistednftsthumbnail } from '../../utils/helper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastConfig, NO_NFTS } from '../../components/Common/StaticData';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import CircleCheckBt from '../../components/Common/CircleCheckBt';
import { getCollectionSummary } from '../../utils/helper';
import LoaderImage from '../../assets/loader.png';

const searchItems = ['Name: Sort A to Z', 'Name: Sort Z to A', 'Price: Low to High', 'Price: High to Low'];
let showCounts = -1;

const MarketPlace = () => {
  const interval = React.useRef();

  const [searchText, setSearchText] = useState('');
  const [enterdTxt, setEnterdTxt] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [nfttokens, setNftTokens] = useState([]);
  const [collectionSummary, setCollectionSummary] = useState([]);

  const KNProgram = useSelector((state) => state.main.KNProgram);

  const [nonftsFlag, setNoNftsFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceSelect, setPriceSelect] = useState(searchItems[0]);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [showIndex, setShowIndex] = useState(0);
  const [rowCount, setRowCount] = useState(4);
  const match1 = useMediaQuery('(min-Width: 1472px)');
  const match2 = useMediaQuery('(min-Width: 1128px)');
  const match3 = useMediaQuery('(min-Width: 784px)');
  const match4 = useMediaQuery('(min-Width: 480px)');

  useEffect(() => {
    if (match1) setRowCount(4);
    else if (match2) setRowCount(3);
    else if (match3) setRowCount(2);
    else if (match4) setRowCount(1);
  });

  const onClearSearch = () => {
    setSearchText('');
    setEnterdTxt('');
    setUpdateFlag(!updateFlag);
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setEnterdTxt(searchText);
    }, 1000);
    return () => clearTimeout(timeOutId);
  }, [searchText]);

  useEffect(() => {
    const getCollectionsData = async () => {
      let temp = await getCollectionSummary('Aquarius');
      setCollectionSummary(temp);
    };
    getCollectionsData();
  }, [showDetailModal]);

  useEffect(() => {
    const getCollectionsData = async () => {
      let temp = await getCollectionSummary('Aquarius');
      setCollectionSummary(temp);
      return () => {
        clearInterval(interval.current);
      };
    };
    getCollectionsData();
  }, []);

  useEffect(() => {
    if (nonftsFlag) {
      toast.warn(NO_NFTS, toastConfig);
    }
  }, [nonftsFlag]);

  useEffect(() => {
    showCounts = -1;
  }, []);

  useEffect(() => {
    const fetchNFTData = async () => {
      setLoading(true);
      setNftTokens([]);
      let order_field = '';
      let order_type = '';

      if (priceSelect == searchItems[0]) {
        order_field = 'name';
        order_type = 'asc';
      } else if (priceSelect == searchItems[1]) {
        order_field = 'name';
        order_type = 'desc';
      } else if (priceSelect == searchItems[2]) {
        order_field = 'price';
        order_type = 'asc';
      } else if (priceSelect == searchItems[3]) {
        order_field = 'price';
        order_type = 'desc';
      }
      setShowIndex(showIndex + 1);
      showCounts++;
      clearInterval(interval.current);
      let itemDatas = await ahgetlistednfts(order_field, order_type, enterdTxt, '');
      var interval_id = window.setInterval(() => {}, 99999);
      for (var i = 0; i < interval_id; i++) window.clearInterval(i);
      if (showIndex !== showCounts) {
        return;
      }
      if (itemDatas.length === 0) {
        setNftTokens([]);
        setLoading(false);
        return;
      }
      let temp = itemDatas.filter((item) => item.thumbnail != null);

      if (showIndex === showCounts) {
        setNftTokens([...temp]);
      } else {
        setLoading(true);
        clearInterval(interval.current);
        setNftTokens([]);
      }
      let showCount = -1;
      if (itemDatas.length > 10) {
        showCount++;
        let resdata = await ahgetlistednftsthumbnail(order_field, order_type, enterdTxt, '', 10, MarketplacePgSize);
        resdata.map((item) => {
          let index = itemDatas.findIndex((val) => val.nft_mint_address === item.nft_mint_address);
          if (index != -1) {
            itemDatas[index].thumbnail = item.thumbnail;
          }
        });
        temp = itemDatas.filter((item) => item.thumbnail != null);
        if (showIndex === showCounts) {
          setNftTokens([...temp]);
        }
        if (10 + MarketplacePgSize >= itemDatas.length) {
          if (showIndex === showCounts) {
            setLoading(false);
          }
          return;
        }
        interval.current = setInterval(() => {
          showCount++;
          ahgetlistednftsthumbnail(
            order_field,
            order_type,
            enterdTxt,
            '',
            10 + showCount * MarketplacePgSize,
            MarketplacePgSize
          ).then((resdata) => {
            resdata.map((item) => {
              let index = itemDatas.findIndex((val) => val.nft_mint_address == item.nft_mint_address);
              if (index != -1) {
                itemDatas[index].thumbnail = item.thumbnail;
              }
            });
            temp = [...itemDatas].filter((item) => item.thumbnail != null);
            if (showIndex === showCounts) {
              setNftTokens([...temp]);
            }
            if (10 + (showCount + 1) * MarketplacePgSize >= itemDatas.length) {
              if (showIndex === showCounts) {
                setLoading(false);
              }
            }
          });
          if (10 + (showCount + 1) * MarketplacePgSize >= itemDatas.length) {
            clearInterval(interval.current);
          }
        }, CallTime);
      } else {
        setLoading(false);
      }
    };
    fetchNFTData();
    // setFirstFlag(true);
  }, [enterdTxt, priceSelect, updateFlag]);

  const Tag = ({ type }) => {
    return <Box className="mp-nft-cards-list-card-inner-tag">{type}</Box>;
  };

  const handleChangePriceSelect = (value) => {
    setPriceSelect(value);
  };

  const showCard = () => {
    let length = parseInt(nfttokens.length);
    let rows = [];
    for (let i = 0; i < length / rowCount; i++) {
      let row = [];
      for (let j = 0; j < rowCount; j++) {
        const item = nfttokens[i * rowCount + j];
        if (item) {
          row.push(
            <Box key={i.toString() + '-' + j.toString()} className="mp-nft-cards-list-card">
              <Box
                className="mp-nft-cards-list-card-inner"
                onClick={() => {
                  setShowDetailModal(true);
                  setSelectedItem(item);
                }}
              >
                <Tag type={item.collection_name} />
                <LazyLoadImage
                  effect="opacity"
                  src={`data:image/png;base64,${item.thumbnail}`}
                  alt="collection"
                  placeholderSrc={LoaderImage}
                  className="mp-nft-cards-list-card-inner-img"
                />
                <Typography className="nft-card-title">{item.nft_name.toString()}</Typography>
                <Typography className="nft-card-sol">{item.price.toString()} SOL</Typography>
              </Box>
            </Box>
          );
        } else {
          row.push(<Box key={i.toString() + '-' + j.toString()} className="mp-nft-cards-list-card"></Box>);
        }
      }
      rows.push(
        <div key={'card' + i} className="flex justify-content-between w-full">
          {row}
        </div>
      );
    }

    return rows;
  };

  return (
    <Box className="mp-marketplace">
      <Container>
        <div className="mp-marketplace-inner">
          <div className="mp-marketplace-title-section">
            <Grid container spacing={6}>
              <Grid item xs={12} md={12} lg={4}>
                <div className="mp-marketplace-title">Marketplace</div>
              </Grid>
              <Grid item xs={12} lg={8}>
                <Box className="mp-marketplace-search-box">
                  <Box className="mp-marketplace-search-box-inner">
                    <Box className="mp-marketplace-search-box-inner-search">
                      <Box className="mp-marketplace-search-box-inner-search-icon">
                        <IconButton className="mp-marketplace-search-box-inner-search-btn">
                          <SearchIcon />
                        </IconButton>
                      </Box>
                      <Input
                        className="mp-marketplace-search-box-inner-search-text"
                        inputProps={{ style: { textAlign: 'left' } }}
                        endAdornment={
                          <InputAdornment position="end">
                            {searchText.length != 0 && (
                              <IconButton
                                onClick={onClearSearch}
                                edge="end"
                                className="mp-marketplace-search-box-inner-icon-btn"
                              >
                                <ClearIcon />
                              </IconButton>
                            )}
                          </InputAdornment>
                        }
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Search"
                        onFocus={(e) => (e.target.placeholder = '')}
                      />
                    </Box>

                    <Box className="mp-marketplace-search-box-inner-search-select">
                      <Select
                        className="mp-marketplace-search-box-inner-select"
                        id="demo-simple-select"
                        value={priceSelect}
                        onChange={(e) => handleChangePriceSelect(e.target.value)}
                      >
                        {searchItems.map((item, index) => (
                          <MenuItem className="mp-marketplace-menuitem" key={index} value={searchItems[index]}>
                            <CircleCheckBt checked={priceSelect === searchItems[index] ? true : false} />
                            <ListItemText
                              className={`${
                                priceSelect === searchItems[index] ? 'is-selected' : ''
                              } mp-marketplace-menuitem-text`}
                              primary={searchItems[index]}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </div>
          <Container className="mp-marketplace-user-info">
            {collectionSummary.length !== 0 ? (
              <Box className="mp-marketplace-user-info-inner">
                <div className="avatar-box">
                  <LazyLoadImage
                    effect="opacity"
                    placeholderSrc={window.location.origin + '/' + 'Aquarius' + '.png'}
                    src={window.location.origin + '/' + collectionSummary[0].collection_name + '.png'}
                    alt="collection"
                    className="mp-marketplace-user-info-inner-avatar"
                  />
                </div>
                <div className="mp-marketplace-user-info-inner-username">{collectionSummary[0].collection_name}</div>
                <Grid container spacing={1}>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">TOTAL LISTED</Box>
                      <Box className="mp-marketplace-card-value truncate">{collectionSummary[0].total_listed_count}</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">LAST SALE PRICE</Box>
                      <Box className="mp-marketplace-card-value truncate">
                        {collectionSummary[0].avg_sale_price_last_24h} SOL
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">TOTAL VOLUME</Box>
                      <Box className="mp-marketplace-card-value truncate">{collectionSummary[0].total_volumn} SOL</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">FLOOR PRICE</Box>
                      <Box className="mp-marketplace-card-value truncate">{collectionSummary[0].floor_price} SOL</Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box className="mp-marketplace-user-info-inner">
                <div className="avatar-box">
                  <LazyLoadImage
                    effect="opacity"
                    placeholderSrc={window.location.origin + '/' + 'Aquarius' + '.png'}
                    src={window.location.origin + '/' + 'Aquarius' + '.png'}
                    alt="collection"
                    className="mp-marketplace-user-info-inner-avatar"
                  />
                </div>

                <div className="mp-marketplace-user-info-inner-username">Aquarius</div>
                <Grid container spacing={4}>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">TOTAL LISTED</Box>
                      <Box className="mp-marketplace-card-value truncate">{0}</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">LAST SALE PRICE</Box>
                      <Box className="mp-marketplace-card-value truncate">{0} SOL</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">TOTAL VOLUME</Box>
                      <Box className="mp-marketplace-card-value truncate">{0} SOL</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box className="mp-marketplace-card">
                      <Box className="mp-marketplace-card-title truncate">FLOOR PRICE</Box>
                      <Box className="mp-marketplace-card-value truncate">{0} SOL</Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Container>
        </div>
        <Box className="mp-nft-cards-list">{showCard()}</Box>
      </Container>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 5, paddingBottom: 5 }}>
          <CircularProgress disableShrink />
        </Box>
      )}
      {selectedItem != null && (
        <DetailModal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          item={selectedItem}
          program={KNProgram}
          updatePage={() => setUpdateFlag(!updateFlag)}
        />
      )}
      <ToastContainer />
    </Box>
  );
};
export default MarketPlace;

