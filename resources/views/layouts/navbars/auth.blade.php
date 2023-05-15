<div class="sidebar" data-color="white" data-active-color="danger">
    <div class="logo">
        <a href="{{ route('page.index', 'dashboard') }}" class="simple-text logo-normal text-center">
            Hey, {{ __(auth()->user()->name)}}
        </a>
    </div>
    <div class="sidebar-wrapper">
        <ul class="nav">
            <li class="{{ $elementActive == 'dashboard' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'dashboard') }}">
                    <i class="nc-icon nc-bank"></i>
                    <p>{{ __('Dashboard') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'users' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'users') }}">
                    <i class="nc-icon nc-badge"></i>
                    <p>{{ __(' Utilisateurs') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'drinks' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'drinks') }}">
                    <i class="nc-icon nc-bullet-list-67"></i>
                    <p>{{ __('Group & Boissons') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'qrcode' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'qrcode') }}">
                    <i class="nc-icon nc-touch-id"></i>
                    <p>{{ __('Menu') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'map' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'map') }}">
                    <i class="nc-icon nc-pin-3"></i>
                    <p>{{ __('Bars') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'icons' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'icons') }}">
                    <i class="nc-icon nc-diamond"></i>
                    <p>{{ __('Icones') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'notifications' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'notifications') }}">
                    <i class="nc-icon nc-bell-55"></i>
                    <p>{{ __('Notifications') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'tables' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'tables') }}">
                    <i class="nc-icon nc-tile-56"></i>
                    <p>{{ __('Table List') }}</p>
                </a>
            </li>
            <li class="{{ $elementActive == 'typography' ? 'active' : '' }}">
                <a href="{{ route('page.index', 'typography') }}">
                    <i class="nc-icon nc-caps-small"></i>
                    <p>{{ __('Typography') }}</p>
                </a>
            </li>
        </ul>
    </div>
</div>
