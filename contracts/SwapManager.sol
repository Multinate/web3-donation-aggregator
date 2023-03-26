// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "./interfaces/IPancakeRouter02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IHypERC20.sol";
import "@hyperlane-xyz/core/interfaces/IInterchainGasPaymaster.sol";
import "@hyperlane-xyz/core/interfaces/IMailbox.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDonate.sol";

contract SwapManager is Ownable {
    using SafeMath for uint256;

    address public usdcToken;
    address public hypUSDCToken;
    address public multinate;
    // IMailbox public mailbox;
    uint32 public chainId;
    IPancakeRouter02 public uniswapRouter;
    // The Mailbox (same address on all EVM chains)
    IMailbox mailbox = IMailbox(0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70);
    // The mainnet DefaultIsmInterchainGasPaymaster
    // (same address on all mainnet EVM chains)
    IInterchainGasPaymaster igp = IInterchainGasPaymaster(0x56f52c0A1ddcD557285f7CBc782D3d83096CE1Cc);
    event DonationReceived(address indexed donor, address indexed token, uint256 amount);
    event DonationReceivedETH(address indexed donor, uint256 amount);
    event Swapped(address indexed token, uint256 amountIn, uint256 amountOut);

    constructor(
        address _usdcToken,
        address _hypUSDCToken,
        address _uniswapRouter,
        address _multinate,
        uint32 _chainId
    ) {
        usdcToken = _usdcToken;
        hypUSDCToken = _hypUSDCToken;
        multinate = _multinate;
        chainId = _chainId;
        uniswapRouter = IPancakeRouter02(_uniswapRouter);
    }

    function addressToBytes32(address addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }

    function donate(address _token, uint256 _amount, uint256 _campaignId) external payable {
        IERC20 token = IERC20(_token);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        uint256 _amountsOut;
        if (_token != usdcToken) {
            _amountsOut = swap(_token, _amount);
        }
        if (chainId != 100) {
            // Call Hyperlane to bridge USDC to Optimism and require success
            IHypERC20(hypUSDCToken).transferRemote{ value: 0.01 ether }(chainId, addressToBytes32(multinate), _amount);
            bytes32 messageId = mailbox.dispatch(
                chainId,
                addressToBytes32(multinate),
                abi.encode(msg.sender, _campaignId, _amountsOut)
            );
            igp.payForGas{ value: msg.value }(
                messageId, // The ID of the message that was just dispatched
                chainId, // The destination domain of the message
                50000, // 50k gas to use in the recipient's handle function
                msg.sender // refunds go to msg.sender, who paid the msg.value
            );
        } else {
            IDonate(multinate).donate(_campaignId, _amountsOut);
        }

        // Emit event
        emit DonationReceived(msg.sender, _token, _amountsOut);
    }

    function donateETH(uint256 _campaignId) external payable {
        require(msg.value > 0.01 ether, "No ETH received");
        emit DonationReceived(msg.sender, address(0), msg.value);
        uint256 _amountsOut = swapETH(msg.value - 0.01 ether);

        if (chainId != 100) {
            // Call Hyperlane to bridge USDC to Optimism
            IHypERC20(hypUSDCToken).transferRemote{ value: 0.01 ether }(
                chainId,
                addressToBytes32(multinate),
                msg.value - 0.01 ether
            );
            bytes32 messageId = mailbox.dispatch(
                chainId,
                addressToBytes32(multinate),
                abi.encode(msg.sender, _campaignId, _amountsOut)
            );
            igp.payForGas{ value: msg.value }(
                messageId, // The ID of the message that was just dispatched
                chainId, // The destination domain of the message
                50000, // 50k gas to use in the recipient's handle function
                msg.sender // refunds go to msg.sender, who paid the msg.value
            );
        } else {
            IDonate(multinate).donate(_campaignId, _amountsOut);
        }
        emit DonationReceivedETH(msg.sender, _amountsOut);
    }

    function swap(address _token, uint256 _amount) private returns (uint256) {
        IERC20 token = IERC20(_token);
        uint256 deadline = block.timestamp + 600; // 10 minutes
        token.approve(address(uniswapRouter), _amount);

        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = usdcToken;

        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(_amount, 1, path, address(this), deadline);

        emit Swapped(_token, amounts[0], amounts[1]);
        return amounts[1];
    }

    function swapETH(uint256 _ethAmount) private returns (uint256) {
        uint256 deadline = block.timestamp + 600; // 10 minutes

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = usdcToken;

        uint256[] memory amounts = uniswapRouter.swapExactETHForTokens{ value: _ethAmount }(
            1,
            path,
            address(this),
            deadline
        );

        emit Swapped(address(0), amounts[0], amounts[1]);
        return amounts[1];
    }

    // Setters
    function setMultinate(address _multinate) external {
        multinate = _multinate;
    }

    function setChainId(uint32 _chainId) external {
        chainId = _chainId;
    }

    function setUniswapRouter(address _uniswapRouter) external {
        uniswapRouter = IPancakeRouter02(_uniswapRouter);
    }

    function setHypUSDCToken(address _hypUSDCToken) external {
        hypUSDCToken = _hypUSDCToken;
    }

    function setUsdcToken(address _usdcToken) external {
        usdcToken = _usdcToken;
    }
}
