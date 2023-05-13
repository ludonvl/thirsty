@extends('layouts.app', [
    'class' => '',
    'elementActive' => 'qrcode'
])

@section('content')
    <div class="content">
        <div class="row">
            <div class="col-md-12">
                <div class="card ">
                    <div class="card-header ">
                        <h5 class="title">QRcode</h5>
                        <p class="category">Scanne moi</p>
                    </div>
                    <div class="card-body">
                        {{ $data['qrcode'] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        $(document).ready(function() {
            demo.initGoogleMaps();
        });
  </script>
@endpush
