// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "./interfaces/IPancakeRouter02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IHypERC20.sol";

contract SwapManager {
    using SafeMath for uint256;

    address public usdcToken;
    address public hypUSDCToken;
    address public multinate;
    uint32 public chainId;
    IPancakeRouter02 public uniswapRouter;

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

    function donate(address _token, uint256 _amount) external payable {
        // Require msg.value to be at least 0.01 ETH to pay for interchain gas
        require(msg.value >= 0.01 ether, "Not enough ETH sent");
        IERC20 token = IERC20(_token);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        if (_token != usdcToken) {
            swap(_token, _amount);
        }
        // Call Hyperlane to bridge USDC to Optimism and require success
        IHypERC20(hypUSDCToken).transferRemote{ value: 0.01 ether }(chainId, addressToBytes32(multinate), _amount);
        // Emit event
        emit DonationReceived(msg.sender, _token, _amount);
    }

    function donateETH() external payable {
        require(msg.value > 0.01 ether, "No ETH received");
        emit DonationReceived(msg.sender, address(0), msg.value);
        swapETH(msg.value - 0.01 ether);

        // Call Hyperlane to bridge USDC to Optimism
        IHypERC20(hypUSDCToken).transferRemote{ value: 0.01 ether }(
            chainId,
            addressToBytes32(multinate),
            msg.value - 0.01 ether
        );
        emit DonationReceivedETH(msg.sender, msg.value - 0.01 ether);
    }

    function swap(address _token, uint256 _amount) private {
        IERC20 token = IERC20(_token);
        uint256 deadline = block.timestamp + 600; // 10 minutes
        token.approve(address(uniswapRouter), _amount);

        address[] memory path = new address[](2);
        path[0] = _token;
        path[1] = usdcToken;

        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(_amount, 1, path, address(this), deadline);

        emit Swapped(_token, amounts[0], amounts[1]);
    }

    function swapETH(uint256 _ethAmount) private {
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
