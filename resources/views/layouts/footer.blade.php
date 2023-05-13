<footer class="footer footer-black  footer-white ">
    <div class="container-fluid">
        <div class="row">
            <div class="credits ml-auto">
                <span class="copyright">
                    ©
                    <script>
                        document.write(new Date().getFullYear())
                    </script>{{ __(', fait avec ') }}<i class="fa fa-heart heart"></i>{{ __(' par ') }}<a class="@if(Auth::guest()) text-white @endif" href="https://cv.ludovicnouvel.com" target="_blank">{{ __('Ludo') }}</a>
                </span>
            </div>
        </div>
    </div>
</footer>
