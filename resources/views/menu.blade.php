@extends('layouts.app', [
    'class' => 'login-page',
    'elementActive' => ''
])

@section('content')
<div class="content">
    <div class="container">
        <h1>Carte de {{ $menu->user->name }}</h1>
        <div>
            {{ $qrcode }}
        </div>
        @foreach ($menu->groups as $group)
        <div class="col-md-8 ml-auto mr-auto">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">{{$group->name}}</h4>
                </div>
                <div class="card-body">
                    @foreach ($group->drinks as $drink)
                        <p>{{$drink->name}}</p>
                    @endforeach
                </div>
            </div>
        </div>
        @endforeach
    </div>
</div>
@endsection

@push('scripts')
    <script>
        $(document).ready(function() {
            demo.checkFullPageBackgroundImage();
        });
    </script>
@endpush
