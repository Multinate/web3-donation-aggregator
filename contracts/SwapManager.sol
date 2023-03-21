// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SwapManager {
    using SafeMath for uint256;

    address public usdcToken;
    IUniswapV2Router02 public uniswapRouter;

    event DonationReceived(address indexed donor, address indexed token, uint256 amount);
    event Swapped(address indexed token, uint256 amountIn, uint256 amountOut);

    constructor(address _usdcToken, address _uniswapRouter) {
        usdcToken = _usdcToken;
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    function donate(address _token, uint256 _amount) external {
        IERC20 token = IERC20(_token);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        emit DonationReceived(msg.sender, _token, _amount);

        if (_token != usdcToken) {
            swap(_token, _amount);
        }

        // TODO: Call Hyperlane to bridge USDC to Optimism
    }

    function donateETH() external payable {
        require(msg.value > 0, "No ETH received");
        emit DonationReceived(msg.sender, address(0), msg.value);
        swapETH(msg.value);

        // TODO: Call Hyperlane to bridge USDC to Optimism
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
}
