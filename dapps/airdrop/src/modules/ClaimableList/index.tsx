import React, { useCallback, useState, memo } from 'react';
import { watchAsset, Unit } from '@cfxjs/use-wallet/dist/ethereum'
import { shortenAddress } from '@fluent-wallet/shorten-address';
import List from 'common/components/List';
import Tooltip from 'common/components/Tooltip';
import { useTokenList, currentNetwork, type Token } from 'airdrop/src/store';
import Add from 'common/assets/add-to-wallet.svg';
import Open from 'cross-space/src/assets/open.svg';
import BalanceText from 'common/modules/BalanceText';
import { handleClaim } from './handleCliam';
import Spin from 'common/components/Spin';
import './index.css';

const ClaimableList: React.FC = () => {
    const tokenList = useTokenList();

    return (
        <List
            id="airdrop-claimable-list"
            className="flex flex-col"
            list={tokenList}
            itemKey="core_address"
            ItemWrapperClassName="airdrop-claimable-token"
            animatedSize
            animationType='slideRight'
        >
            {(token) => 
                <TokenItem {...token} />
            }
        </List>
    );
}

const TokenItem = memo<Token & { balance?: Unit; trackChangeOnce: (cb: () => void) => void; }>(({ children, ...token}) => {
    const { eSpace_address, name, symbol, icon, balance } = token;
    const [inClaiming, setInClaiming] = useState(false);
    const handleClickAddToWallet = useCallback<React.MouseEventHandler<HTMLImageElement>>(async (evt) => {
        evt.stopPropagation();
        try {
            await (watchAsset)({
                type: 'ERC20',
                options: {
                    address: eSpace_address,
                    symbol: symbol,
                    decimals: 18,
                    image: icon
                },
            });
        } catch (err) {
            console.error((`Add ${symbol} to MetaMask failed!`));
        }
    }, []);

    return (
        <div
            className="relative flex justify-between items-center h-[56px] gap-[40px]"
        >
            <div className="flex items-center w-[200px]">
                <img src={icon} alt="token img" className="w-[28px] h-[28px] mr-[8px]" />

                <div className='h-[36px]'>
                    <p className='text-[14px] text-[#3D3F4C]'>{symbol}</p>
                    <p className='text-[12px] text-[#A9ABB2]'>{name}</p>
                </div>
            </div>

            <div className='w-[160px]'>
                <p className='text-[14px] text-[#3D3F4C]'>Claimable</p>
                <BalanceText className="text-[12px] text-[#A9ABB2]" balance={balance} symbol={symbol} />
            </div>
            
            <button
                className="button button-outlined button-small min-w-[60px]"
                disabled={inClaiming || !balance || balance?.toDecimalStandardUnit() === '0'}
                onClick={() => handleClaim(token, setInClaiming)}
            >
                {!inClaiming && 'Claim'}
                {inClaiming && <Spin className='text-[20px] text-[#808BE7]' /> }
            </button>

            <div className='flex items-center'>
                <span className='text-[12px] text-[#808BE7]'>{shortenAddress(eSpace_address)}</span>
                <Tooltip text="Add to MetaMask">
                    <img src={Add} alt="add image" className='ml-[8px] w-[16px] h-[16px] cursor-pointer' onClick={handleClickAddToWallet}/>
                </Tooltip>
                <Tooltip text="View in Scan">
                    <a href={`${currentNetwork.eSpace.scan}/token/${eSpace_address}`} target="_blank" rel="noopener">
                        <img src={Open} alt="open image" className='ml-[8px] w-[18px] h-[18px] cursor-pointer' />
                    </a>
                </Tooltip>
            </div>
        </div>
    );
});

export default ClaimableList;